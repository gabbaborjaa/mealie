import { useState, useEffect } from "react";
import { Button} from "react-bootstrap";
import NavBar from "./Components/Navbar";
import EditMeal from "./Components/EditMeal";
import AddMeal from "./Components/AddMeal";
import './Mealie.css';
import './styles/font.css';
import { collection, doc, getDocs, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";


/**
 * Utility function to get the current week based on the number of days (7 or 5).
 * For a 5-day view, the week starts on Monday.
 * @param {Date} date - The starting date.
 * @param {number} days - Number of days in the week (7 or 5).
 * @returns {Array<Date>} - Array of dates for the week.
 */
const getCurrentWeek = (date = new Date()) => {
    const startOfWeek = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()));
    // startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Always start on Sunday
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setUTCDate(startOfWeek.getUTCDate() + i);
        return day;
    });
};

const Mealie = () => {
    // State variables
    const [meals, setMeals] = useState([]); // Stores all meals grouped by date
    const [showEditModal, setShowEditModal] = useState(false); // Controls the edit modal visibility
    const [editMeal, setEditMeal] = useState(null); // Tracks the meal being edited
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek()); // Tracks the current week being displayed
    // const [isSevenDayView, setIsSevenDayView] = useState(true); // Toggles between 7-day and 5-day views
    const [newMeal, setNewMeal] = useState({
        date: new Date().toISOString().split("T")[0], // Default to today's date
        type: "breakfast", // Default meal type
        name: "",
        protein: 0,
        carbs: 0,
        sugars: 0,
    });
    const [showModal, setShowModal] = useState(false); // Controls the add meal modal visibility
    const [animationDirection, setAnimationDirection] = useState(""); // Tracks animation direction for week navigation
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [loading, setLoading] = useState(true);
    
    /**
     * Fetch meals from Firestore and group them by date.
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    // Fetch the user's document from Firestore
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        console.log("User data fetched successfully:", userData);
                        setUserName(userData.name); // Set the user's name
                    } else {
                        console.error("User document does not exist in Firestore.");
                    }
                    await fetchMeals(currentUser.uid); // Fetch meals after authentication
                } catch (error) {
                    console.error("Error fetching user document:", error);
                }
            } else {
                setMeals([]);
                setUserName(null); // Clear the name when logged out
            }
            setTimeout(() => {
                setLoading(false); // Set loading to false after authentication is resolved
            }, 1000)
            
        });
        return unsubscribe;
    }, []);
    
    const fetchMeals = async (userId) => {
        try {
            const mealsCollection = collection(db, `users/${userId}/meals`);
            const mealSnapshot = await getDocs(mealsCollection);

            // Debugging: Log fetched meal documents
            console.log("Fetched meals:", mealSnapshot.docs.map((doc) => doc.data()));

            // Group meals by date
            const groupedMeals = mealSnapshot.docs.reduce((acc, doc) => {
                const meal = doc.data();
                const mealType = meal.type?.toLowerCase();
                const mealDate = meal.date;

                if (!acc[mealDate]) {
                    acc[mealDate] = {
                        breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                    };
                }
                if (mealType && acc[mealDate][mealType]) {
                    acc[mealDate][mealType] = {
                        name: meal.name || "",
                        protein: meal.protein || 0,
                        carbs: meal.carbs || 0,
                        sugars: meal.sugars || 0,
                    };
                }
                return acc;
            }, {});

            // Debugging: Log grouped meals
            console.log("Grouped meals:", groupedMeals);

            setMeals(groupedMeals);
        } catch (error) {
            console.error("Error fetching meals:", error);
        }
    };
    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loading-message">
                    <h1>Loading...</h1>
                </div>
            </div>
        );
    }

    /**
     * Toggles between 7-day and 5-day calendar views.
     */
    // const toggleCalendarView = () => {
    //     setIsSevenDayView((prev) => {
    //         const newView = !prev;
    //         setCurrentWeek(getCurrentWeek(new Date(currentWeek[0]), newView ? 7 : 5)); // Update the week based on the new view
    //         return newView;
    //     });
    // };

    /**
     * Handles editing a meal by opening the edit modal.
     * @param {Object} meal - The meal data.
     * @param {string} type - The meal type (e.g., breakfast, lunch, dinner).
     * @param {string} dateKey - The date of the meal.
     */
    const handleEditMeal = (meal, type, dateKey) => {
        setEditMeal({ ...meal[type], type, day: dateKey });
        setShowEditModal(true);
    };

    /**
     * Deletes a meal from Firestore and updates the local state.
     * @param {string} dateKey - The date of the meal.
     * @param {string} type - The meal type (e.g., breakfast, lunch, dinner).
     */
    const deleteMeal = async (dateKey, type) => {
        if (!user) return;
        const confirmDelete = window.confirm("Are you sure you want to delete this meal?");
        if (!confirmDelete) return;

        try {
            const mealToDelete = meals[dateKey]?.[type];
            if (!mealToDelete || !mealToDelete.name) {
                console.error("Meal to delete not found!");
                return;
            }

            const mealDocId = `${dateKey}_${type}`;
            const mealDoc = doc(db, `users/${user.uid}/meals/${mealDocId}`);

            await deleteDoc(mealDoc);

            // Update the local meals state
            setMeals((prevMeals) => {
                const updatedMeals = { ...prevMeals };
                if (updatedMeals[dateKey]) {
                    updatedMeals[dateKey][type] = {
                        name: "",
                        protein: 0,
                        carbs: 0,
                        sugars: 0,
                    };
                }
                return updatedMeals;
            });
            console.log(`Meal deleted sucessfully: ${mealDocId}`)
        } catch (error) {
            console.error("Error deleting meal:", error);
        }
    };

    /**
     * Adds a new meal to Firestore and updates the local state.
     */
    const addMeal = async () => {
        if (!user) {
            alert("You must be signed in to add a meal.")
        };
        setShowModal(false);

        try {
            const mealsCollection = collection(db, `users/${user.uid}/meals`);
            const mealDocId = `${newMeal.date}_${newMeal.type.replace(/\s+/g, "")}`; // Unique ID
            const mealDoc = doc(mealsCollection, mealDocId);

            const mealToAdd = {
                ...newMeal,
                date: newMeal.date,
                userId: user.uid,
            };
            
            await setDoc(mealDoc, mealToAdd);

            // Update local state
            setMeals((prevMeals) => {
                const updatedMeals = { ...prevMeals };
                if (!updatedMeals[mealToAdd.date]) {
                    updatedMeals[mealToAdd.date] = {
                        breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                    };
                }
                updatedMeals[mealToAdd.date][mealToAdd.type] = { ...newMeal };
                return updatedMeals;
            });

            // Reset the newMeal state
            setNewMeal({
                date: new Date().toISOString().split("T")[0],
                type: "breakfast",
                name: "",
                protein: 0,
                carbs: 0,
                sugars: 0,
            });
        } catch (error) {
            console.error("Error adding meal:", error);
        }
    };

    /**
     * Saves an edited meal to Firestore and updates the local state.
     */
    const saveMeal = async () => {
        if (!user) return;
        try {
            // const mealsCollection = collection(db, 'meals');
            const mealDocId = `${editMeal.day}_${editMeal.name.replace(/\s+/g, "")}`;
            const mealDoc = doc(db, `users/${user.uid}/meals/${mealDocId}`);

            await setDoc(mealDoc, {...editMeal, userId: user.uid});

            setMeals((prevMeals) => {
                const updatedMeals = { ...prevMeals };
                if (updatedMeals[editMeal.day]) {
                    updatedMeals[editMeal.day][editMeal.type] = { ...editMeal };
                }
                return updatedMeals;
            });

            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating meal:", error);
        }
    };
    // const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; // Days of the week
    const mealTypes = ["Breakfast", "Lunch", "Dinner"];

    // Main UI
    return (
        <div className="main-container">
            {/* <NavBar setShowModal={setShowModal} />
            <NavBar userName={userName} /> */}
            <NavBar userName={userName} setShowModal={setShowModal} />
            {/* Add Meal Button */}
            <div className="add-meal">
                <Button variant="primary" onClick={() => setShowModal(true)}>Add Meal</Button>
            </div>

            {/* Week Navigation */}
            <div className="week-nav">
                <Button
                    variant="secondary"
                    onClick={() => {
                        setAnimationDirection("prev");
                        setTimeout(() => {
                            setCurrentWeek((prevWeek) => {
                                const previousWeekStart = new Date(prevWeek[0]); // Get the first day of the current week
                                // const newStartDate = new Date(previousWeekStart); // Create a new Date object
                                previousWeekStart.setUTCDate(previousWeekStart.getUTCDate()); // Move back 7 days
                                return getCurrentWeek(previousWeekStart); // Update the week
                            });
                            setAnimationDirection("");
                        }, 300);
                    }}
                >
                    Previous Week
                </Button>

                <Button
                    className="week-nav-button"
                    variant="secondary"
                    onClick={() => {
                        setAnimationDirection("next");
                        setTimeout(() => {
                            setCurrentWeek((prevWeek) => {
                                const nextWeekStart = new Date(prevWeek[0]); // Get the first day of the current week
                                // const newStartDate = new Date(nextWeekStart); // Create a new Date object
                                nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 14); // Move forward 7 days
                                return getCurrentWeek(nextWeekStart); // Update the week
                            });
                            setAnimationDirection("");
                        }, 300);
                    }}
                >
                    Next Week
                </Button>
            </div>

            {/* Calendar Table */}
            <div className={`calendar-container ${animationDirection}`}>
                <div className="calendar-grid">
                    {currentWeek.map((date) => {
                        const dateKey = date.toISOString().split("T")[0];
                        const dayMeals = meals[dateKey] || {}; // Get meals for the current date

                        return (
                            <div key={dateKey} className="calendar-day">
                                <div className="day-header">
                                {new Date(date.toISOString().split("T")[0]).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                                <div className="day-body">
                                    {mealTypes.map((mealType) => {
                                        const mealData = dayMeals[mealType.toLowerCase()] || {
                                            name: "",
                                            protein: 0,
                                            carbs: 0,
                                            sugars: 0,
                                        };

                                        return (
                                            <div key={mealType} className="meal-item">
                                                <strong>{mealType}</strong>
                                                <div className={`meal-cell ${mealData.name ? "has-meal" : "no-meal"}`}>
                                                    {mealData.name || "No meal"}
                                                    {mealData.name && (
                                                        <>
                                                            <div className="nutrition-data mt-2">
                                                                <small>Protein: {mealData.protein}g</small>
                                                                <br />
                                                                <small>Carbs: {mealData.carbs}g</small>
                                                                <br />
                                                                <small>Sugars: {mealData.sugars}g</small>
                                                            </div>
                                                            <div className="button-group mt-2">
                                                                <Button
                                                                    variant="warning"
                                                                    size="sm"
                                                                    onClick={() => handleEditMeal(meals[dateKey], mealType.toLowerCase(), dateKey)}
                                                                >
                                                                    Update
                                                                </Button>
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    className="ms-2"
                                                                    onClick={() => deleteMeal(dateKey, mealType.toLowerCase())}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {console.log("Current week dates:", currentWeek.map((date) => date.toISOString().split("T")[0]))}

            {/* Add Meal Modal */}
            <AddMeal
                showModal={showModal}
                setShowModal={setShowModal}
                newMeal={newMeal}
                setNewMeal={setNewMeal}
                addMeal={addMeal}
            />

            {/* Edit Meal Modal */}
            <EditMeal
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                editMeal={editMeal}
                setEditMeal={setEditMeal}
                saveMeal={saveMeal}
            />
            
        </div>
    );
};

export default Mealie;
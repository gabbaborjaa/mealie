import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import NavBar from "./Components/Navbar";
import EditMeal from "./Components/EditMeal";
import AddMeal from "./Components/AddMeal";
import './Mealie.css';
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
const getCurrentWeek = (date = new Date(), days = 7) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (days === 5 ? 1 : 0)); // Start on Monday for 5-day view
    return Array.from({ length: days }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });
};

const Mealie = () => {
    // State variables
    // const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; // Days of the week
    const [meals, setMeals] = useState([]); // Stores all meals grouped by date
    const [showEditModal, setShowEditModal] = useState(false); // Controls the edit modal visibility
    const [editMeal, setEditMeal] = useState(null); // Tracks the meal being edited
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek()); // Tracks the current week being displayed
    const [isSevenDayView, setIsSevenDayView] = useState(true); // Toggles between 7-day and 5-day views
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
                        console.log("User data fetched:", userData); // Debugging
                        setUserName(userData.name); // Set the user's name
                    } else {
                        console.error("User document does not exist in Firestore.");
                    }
                    fetchMeals(currentUser.uid);
                } catch (error) {
                    console.error("Error fetching user document:", error);
                }
            } else {
                setMeals([]);
                setUserName(""); // Clear the name when logged out
            }
        });
        return unsubscribe;
    }, []);

    const fetchMeals = async (userId) => {
        try {
            const mealsCollection = collection(db, `users/${userId}/meals`);
            const mealSnapshot = await getDocs(mealsCollection);

            // Group meals by date
            const groupedMeals = mealSnapshot.docs.reduce((acc, doc) => {
                const meal = doc.data();
                if (!acc[meal.date]) {
                    acc[meal.date] = {
                        breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                    };
                }
                if (meal.meal_type) {
                    acc[meal.date][meal.meal_type] = {
                        name: meal.name || "",
                        protein: meal.protein || 0,
                        carbs: meal.carbs || 0,
                        sugars: meal.sugars || 0,
                    };
                }
                return acc;
            }, {});

            setMeals(groupedMeals);
        } catch (error) {
            console.error("Error fetching meals:", error);
        }
    };

    /**
     * Toggles between 7-day and 5-day calendar views.
     */
    const toggleCalendarView = () => {
        setIsSevenDayView((prev) => {
            const newView = !prev;
            setCurrentWeek(getCurrentWeek(new Date(currentWeek[0]), newView ? 7 : 5)); // Update the week based on the new view
            return newView;
        });
    };

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

            const mealDocId = `${dateKey}_${mealToDelete.name.replace(/\s+/g, "")}`;
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

            await setDoc(mealDoc, {...newMeal, userId: user.uid});

            // Update local state
            setMeals((prevMeals) => {
                const updatedMeals = { ...prevMeals };
                if (!updatedMeals[newMeal.date]) {
                    updatedMeals[newMeal.date] = {
                        breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                    };
                }
                updatedMeals[newMeal.date][newMeal.type] = { ...newMeal };
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
            <NavBar setShowModal={setShowModal} />
            {/* Welcome Message */}
            <div className="welcome-message"> 
                {userName && <h4>Welcome, {userName}!</h4>}
            </div>
            {/* Add Meal Button */}
            <div className="add-meal">
                <Button variant="primary" onClick={() => setShowModal(true)}>Add Meal</Button>
            </div>

            {/* Week Navigation */}
            <div className="week-nav">
                <Button
                    variant="secondary"
                    onClick={() => {
                        setAnimationDirection("next");
                        setTimeout(() => {
                            setCurrentWeek(
                                getCurrentWeek(
                                    new Date(currentWeek[0].getTime() - (isSevenDayView ? 7 : 5) * 24 * 60 * 60 * 1000),
                                    isSevenDayView ? 7 : 5
                                )
                            );
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
                        setAnimationDirection("prev");
                        setTimeout(() => {
                            setCurrentWeek(
                                getCurrentWeek(
                                    new Date(currentWeek[0].getTime() + (isSevenDayView ? 7 : 5) * 24 * 60 * 60 * 1000),
                                    isSevenDayView ? 7 : 5
                                )
                            );
                            setAnimationDirection("");
                        }, 300);
                    }}
                >
                    Next Week
                </Button>

                <Button variant="info" onClick={toggleCalendarView}>
                    Toggle to {isSevenDayView ? "5-Day" : "7-Day"} View
                </Button>
            </div>

            {/* Calendar Table */}
            <div className={`calendar-container ${isSevenDayView ? "" : "five-day-view"}`}>
                <div className="calendar-grid">
                    {currentWeek
                        .filter((date) => isSevenDayView || (date.getDay() !== 0 && date.getDay() !== 6)) // Exclude weekends in 5-day view
                        .map((date) => (
                            <div key={date.toISOString()} className="calendar-day">
                                <div className="day-header">
                                    {date.toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                                <div className="day-body">
                                    {mealTypes.map((mealType) => {
                                        const dateKey = date.toISOString().split("T")[0];
                                        const mealData = meals[dateKey]?.[mealType.toLowerCase()] || {
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
                        ))}
                </div>
            </div>

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
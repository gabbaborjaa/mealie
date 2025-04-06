import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import NavBar from "./Components/Navbar";
import EditMeal from "./Components/EditMeal";
import './Mealie.css';
import { collection, doc, getDocs, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase-config";

const getCurrentWeek = (date = new Date()) => {
    const startofWeek = new Date(date.setDate(date.getDate() - date.getDay()));
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startofWeek);
        day.setDate(startofWeek.getDate() + i);
        return day;
    });
};
const Mealie = () => {
    const [meals, setMeals] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false); // Control the edit modal
    const [editMeal, setEditMeal] = useState(null); // Track the meal being edited
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
    const [newMeal, setNewMeal] = useState({
        date: new Date().toISOString().split("T")[0], // Default to today's date in YYYY-MM-DD format
        type: "breakfast", // Default to breakfast
        name: "",
        protein: 0,
        carbs: 0,
        sugars: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [animationDirection, setAnimationDirection] = useState(""); // Track animation direction

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const mealsCollection = collection(db, 'meals');
                const mealSnapshot = await getDocs(mealsCollection);
                const mealList = mealSnapshot.docs.map((doc) => doc.data());

                // Group meals by date
                const groupedMeals = mealList.reduce((acc, meal) => {
                    if (!acc[meal.date]) {
                        acc[meal.date] = {
                            breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                            lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                            dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        };
                    }
                    acc[meal.date][meal.meal_type] = {
                        name: meal.name,
                        protein: meal.protein,
                        carbs: meal.carbs,
                        sugars: meal.sugars,
                    };
                    return acc;
                }, {});

                setMeals(groupedMeals);
            } catch (error) {
                console.error("Error fetching meals:", error);
            }
        };

        fetchMeals();
    }, []);

    

    const handleEditMeal = (meal, type, dateKey) => {
        setEditMeal({ ...meal[type], type, day: dateKey });
        setShowEditModal(true);
    };

    const deleteMeal = async (dateKey, type) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this meal?");
        if (!confirmDelete) return;
    
        try {
            const mealToDelete = meals[dateKey]?.[type];
            if (!mealToDelete || !mealToDelete.name) {
                console.error("Meal to delete not found!");
                return;
            }
    
            const mealDocId = `${dateKey}_${mealToDelete.name.replace(/\s+/g, "")}`;
            const mealDoc = doc(collection(db, 'meals'), mealDocId);
    
            console.log("Deleting meal:", mealToDelete); // Debugging
    
            // Delete the Firestore document
            await deleteDoc(mealDoc);
    
            console.log("Meal deleted successfully!");
    
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

    const addMeal = async () => {
        setShowModal(false);

        try {
            const mealsCollection = collection(db, 'meals');
            const mealDocId = `${newMeal.date}_${newMeal.type.replace(/\s+/g, "")}`; // Unique ID
            const mealDoc = doc(mealsCollection, mealDocId);

            await setDoc(mealDoc, {
                date: newMeal.date,
                meal_type: newMeal.type,
                name: newMeal.name,
                protein: newMeal.protein,
                carbs: newMeal.carbs,
                sugars: newMeal.sugars,
            });

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
                updatedMeals[newMeal.date][newMeal.type] = {
                    name: newMeal.name,
                    protein: newMeal.protein,
                    carbs: newMeal.carbs,
                    sugars: newMeal.sugars,
                };
                return updatedMeals;
            });

            // Reset the newMeal state
            setNewMeal({
                date: new Date().toISOString().split("T")[0], // Reset to today's date
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

    const saveMeal = async () => {
        try {
            const mealsCollection = collection(db, 'meals');
            const mealDocId = `${editMeal.day}_${editMeal.name.replace(/\s+/g, "")}`;
            const mealDoc = doc(mealsCollection, mealDocId);
            
            console.log("Updating meal:", editMeal);

            await setDoc(mealDoc, {
                day: editMeal.day,
                meal_type: editMeal.type,
                name: editMeal.name,
                protein: editMeal.protein,
                carbs: editMeal.carbs,
                sugars: editMeal.sugars,
            });
    
            console.log("Meal updated successfully!");
            
            setMeals((prevMeals) => {
                const updatedMeals = {...prevMeals };
                if (updatedMeals[editMeal.day]){
                    updatedMeals[editMeal.day][editMeal.type] = {
                        name: editMeal.name,
                        protein: editMeal.protein,
                        carbs: editMeal.carbs,
                        sugars: editMeal.sugars
                    };
                }
                return updatedMeals;
            });

            setShowEditModal(false)

            // Refetch meals to update the UI
            // const mealsCollectionSnapshot = await getDocs(mealsCollection);
            // const updatedMealList = mealsCollectionSnapshot.docs.map((doc) => doc.data());
            // setMeals(updatedMealList);
    
            // setShowEditModal(false); // Close the edit modal
        } catch (error) {
            console.error("Error updating meal:", error);
        }
    };

    // const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
    // const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const mealTypes = ["Breakfast", "Lunch", "Dinner"];

    // Mealie UI
    return (
        <div className="main-container">
            <NavBar setShowModal={setShowModal} />            
            {/* Add Meal Button */}
            <div className="add-meal">
                <Button variant="primary" onClick={() => setShowModal(true)} > Add Meal </Button>
            </div>
            <div className="week-nav"> 
                <Button
                    variant="secondary"
                    onClick={() => {
                        setAnimationDirection("next");
                        setTimeout(() => {
                            setCurrentWeek(getCurrentWeek(new Date(currentWeek[0].setDate(currentWeek[0].getDate() - 7))));
                            setAnimationDirection(""); // Reset animation direction
                        }, 300); // Match the animation duration
                    }}
                >
                    Previous Week
                </Button>
                
                <Button variant="secondary"
                    onClick={() => {
                        setAnimationDirection("prev");
                        setTimeout(() => {
                            setCurrentWeek(getCurrentWeek(new Date(currentWeek[0].setDate(currentWeek[0].getDate() + 7))));
                            setAnimationDirection(""); // Reset animation direction
                        }, 300); // Match the animation duration
                    }}
                >
                    Next Week
                </Button>
            </div>
            {/* Calendar Table */}
            <div className="calendar-container">
                <div className={`calendar-table ${animationDirection}`}>
                    <table className="calender-table th">
                        <thead>
                            <tr>
                                <th>Meal Type</th>
                                {currentWeek.map((date) => (
                                    <th key={date.toISOString()}>{date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {mealTypes.map((mealType) => (
                                <tr key={mealType}>
                                    <td className="meals">{mealType}</td>
                                    {currentWeek.map((date) => {
                                        const dateKey = date.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
                                        const mealData = meals[dateKey]?.[mealType.toLowerCase()] || {
                                            name: "",
                                            protein: 0,
                                            carbs: 0,
                                            sugars: 0,
                                        };

                                        return (
                                            <td key={dateKey} className={`meal-cell ${mealData.name ? "has-meal" : "no-meal"}`}>
                                                <strong>{mealData.name || "No meal"}</strong>
                                                {mealData.name && (
                                                    <>
                                                        <div className="nutrition-data mt-2">
                                                            <small>Protein: {mealData.protein}g</small>
                                                            <br />
                                                            <small>Carbs: {mealData.carbs}g</small>
                                                            <br />
                                                            <small>Sugars: {mealData.sugars}g</small>
                                                        </div>
                                                        <div className="mt-2">
                                                            <button
                                                                className="update"
                                                                onClick={() => handleEditMeal(meals[dateKey], mealType.toLowerCase(), dateKey)}
                                                            >
                                                                Update
                                                            </button>
                                                            <button
                                                                className="delete"
                                                                onClick={() => deleteMeal(dateKey, mealType.toLowerCase())}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddMeal
                showModal={showModal}
                setShowModal={setShowModal}
                newMeal={newMeal}
                setNewMeal={setNewMeal}
                addMeal={addMeal}
            />
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

const AddMeal = ({ showModal, setShowModal, newMeal, setNewMeal, addMeal }) => {
    if (!showModal) return null;

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add Meal</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowModal(false)}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                addMeal();
                            }}
                        >
                            <div className="mb-3">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={newMeal.date}
                                    onChange={(e) => setNewMeal({ ...newMeal, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Meal Type</label>
                                <select
                                    className="form-control"
                                    value={newMeal.type}
                                    onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
                                    required
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Meal Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newMeal.name}
                                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Protein (g)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={newMeal.protein}
                                    onChange={(e) => setNewMeal({ ...newMeal, protein: +e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Carbs (g)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={newMeal.carbs}
                                    onChange={(e) => setNewMeal({ ...newMeal, carbs: +e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Sugars (g)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={newMeal.sugars}
                                    onChange={(e) => setNewMeal({ ...newMeal, sugars: +e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Add Meal
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mealie;
import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import NavBar from "./Components/Navbar";
import AddMeal from "./Components/AddMeal";
import EditMeal from "./Components/EditMeal";
import './Mealie.css';
import { collection, doc, getDocs, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase-config";

const Mealie = () => {
    const [meals, setMeals] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false); // Control the edit modal
    const [editMeal, setEditMeal] = useState(null); // Track the meal being edited
    const [newMeal, setNewMeal] = useState({
        day: "Monday",
        type: "breakfast", // Default to breakfast
        name: "",
        protein: 0,
        carbs: 0,
        sugars: 0,
    });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const mealsCollection = collection(db, 'meals');
                const mealSnapshot = await getDocs(mealsCollection);
                const mealList = mealSnapshot.docs.map((doc) => doc.data());
    
                // Group meals by day and meal type
                const groupedMeals = days.reduce((acc, day) => {
                    acc[day] = {
                        breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                    };
                    return acc;
                }, {});
    
                mealList.forEach((meal) => {
                    if (groupedMeals[meal.day]) {
                        groupedMeals[meal.day][meal.meal_type] = {
                            name: meal.name,
                            protein: meal.protein,
                            carbs: meal.carbs,
                            sugars: meal.sugars,
                        };
                    }
                });
    
                setMeals(groupedMeals);
                console.log("Fetched meals:", groupedMeals);
            } catch (error) {
                console.error("Error fetching meals:", error);
            }
        };
    
        fetchMeals();
    }, []);

    const handleEditMeal = (meal, type, day) => {
        setEditMeal({ ...meal[type], type, day });
        setShowEditModal(true);
    };

    const deleteMeal = async (day, type) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this meal?");
        if (!confirmDelete) return;
    
        try {
            const mealToDelete = meals[day]?.[type];
            if (!mealToDelete || !mealToDelete.name) {
                console.error("Meal to delete not found!");
                return;
            }
    
            const mealDocId = `${day}_${mealToDelete.name.replace(/\s+/g, "")}`;
            const mealDoc = doc(collection(db, 'meals'), mealDocId);
    
            console.log("Deleting meal:", mealToDelete); // Debugging
    
            // Delete the Firestore document
            await deleteDoc(mealDoc);
    
            console.log("Meal deleted successfully!");
    
            // Update the local meals state
            setMeals((prevMeals) => {
                const updatedMeals = { ...prevMeals };
                if (updatedMeals[day]) {
                    updatedMeals[day][type] = {
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
            const mealDocId = `${newMeal.day}_${newMeal.name.replace(/\s+/g, "")}`; // Unique ID
            const mealDoc = doc(mealsCollection, mealDocId);

            console.log("Adding meal: ", newMeal);

            // Add the new meal to Firestore
            await setDoc(mealDoc, {
                day: newMeal.day,
                meal_type: newMeal.type,
                name: newMeal.name,
                protein: newMeal.protein,
                carbs: newMeal.carbs,
                sugars: newMeal.sugars,
            });

            console.log("Meal added successfully!");

            // Update the local meals state directly
            setMeals((prevMeals) => {
                const updatedMeals = { ...prevMeals };
                if (!updatedMeals[newMeal.day]) {
                    updatedMeals[newMeal.day] = {
                        breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                        dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                    };
                }
                updatedMeals[newMeal.day][newMeal.type] = {
                    name: newMeal.name,
                    protein: newMeal.protein,
                    carbs: newMeal.carbs,
                    sugars: newMeal.sugars,
                };
                return updatedMeals;
            });

            // Reset the newMeal state
            setNewMeal({
                day: "Monday",
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

    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const mealTypes = ["Breakfast", "Lunch", "Dinner"];

    // Mealie UI
    return (
        <div className="main-container">
            <NavBar setShowModal={setShowModal} />            
            {/* Add Meal Button */}
            <div className="add-meal">
                <Button variant="primary" onClick={() => setShowModal(true)} > Add Meal </Button>
            </div>

            {/* Calendar Table */}
            <div className="calendar-table">
                <table className="calender-table th">
                    <thead>
                        <tr>
                            <th>Meal Type</th>
                            {days.map((day) => (
                                <th key={day}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {mealTypes.map((mealType) => (
                            <tr key={mealType}>
                                <td className="meals">{mealType}</td>
                                {days.map((day) => {
                                        const mealData = meals[day]?.[mealType.toLowerCase()] || {
                                            name: "",
                                            protein: 0,
                                            carbs: 0,
                                            sugars: 0,
                                    };

                                    return (
                                        <td
                                            key={day}
                                            className={`meal-cell ${mealData.name ? "has-meal" : "no-meal"} ${
                                                day === currentDay ? "table-primary" : ""
                                            }`}
                                        >
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
                                                            onClick={() => handleEditMeal(mealData, mealType.toLowerCase(), day)}
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            className="delete"
                                                            onClick={() => deleteMeal(day, mealType.toLowerCase())}
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

            <AddMeal
                showModal={showModal}
                setShowModal={setShowModal}
                newMeal={newMeal}
                setNewMeal={setNewMeal}
                addMeal={addMeal}
                days={days}
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

export default Mealie;
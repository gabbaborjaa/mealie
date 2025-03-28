import { useState, useEffect } from "react";
import NavBar from "./Components/Navbar";
import AddMeal from "./Components/AddMeal";
import EditMeal from "./Components/EditMeal";
import './Mealie.css';

const Mealie = () => {
    const [meals, setMeals] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false); // Control the edit modal
    const [editMeal, setEditMeal] = useState(null); // Track the meal being edited
    const [newMeal, setNewMeal] = useState({
        day: "",
        type: "breakfast", // Default to breakfast
        name: "",
        protein: 0,
        carbs: 0,
        sugars: 0,
    });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Placeholder for fetching meals
        const fetchMeals = async () => {
            const mealList = [
                {
                    id: "1",
                    day: "Monday",
                    breakfast: { name: "Oatmeal", protein: 5, carbs: 27, sugars: 1 },
                    lunch: { name: "Chicken Salad", protein: 30, carbs: 10, sugars: 5 },
                    dinner: { name: "Steak", protein: 40, carbs: 0, sugars: 0 },
                },
            ];
            setMeals(mealList);
        };

        fetchMeals();
    }, []);

    const handleEditMeal = (meal, type, day) => {
        setEditMeal({ ...meal[type], type, day });
        setShowEditModal(true);
    };

    const saveMeal = () => {
        const updatedMeals = meals.map((meal) => {
            if (meal.day === editMeal.day) {
                return {
                    ...meal,
                    [editMeal.type]: {
                        name: editMeal.name,
                        protein: editMeal.protein,
                        carbs: editMeal.carbs,
                        sugars: editMeal.sugars,
                    },
                };
            }
            return meal;
        });
        setMeals(updatedMeals);
        setShowEditModal(false);
    };

    const deleteMeal = (day, type) => {
        const mealToDelete = meals.find((meal) => meal.day === day)?.[type];
        if (!mealToDelete || !mealToDelete.name) return; // Skip if no meal exists

        const confirmDelete = window.confirm("Are you sure you want to delete this meal?");
        if (!confirmDelete) return;

        const updatedMeals = meals.map((meal) => {
            if (meal.day === day) {
                return {
                    ...meal,
                    [type]: { name: "", protein: 0, carbs: 0, sugars: 0 },
                };
            }
            return meal;
        });
        setMeals(updatedMeals);
    };

    const addMeal = () => {
        const existingMeal = meals.find((meal) => meal.day === newMeal.day);

        if (existingMeal) {
            // Update the existing meal for the selected day
            const updatedMeal = {
                ...existingMeal,
                [newMeal.type]: {
                    name: newMeal.name,
                    protein: newMeal.protein,
                    carbs: newMeal.carbs,
                    sugars: newMeal.sugars,
                },
            };
            setMeals(
                meals.map((meal) =>
                    meal.day === newMeal.day ? updatedMeal : meal
                )
            );
        } else {
            // Add a new meal entry for the selected day
            const newMealEntry = {
                id: Date.now().toString(),
                day: newMeal.day,
                breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                [newMeal.type]: {
                    name: newMeal.name,
                    protein: newMeal.protein,
                    carbs: newMeal.carbs,
                    sugars: newMeal.sugars,
                },
            };
            setMeals([...meals, newMealEntry]);
        }

        // Reset the form and close the modal
        setNewMeal({
            day: "",
            type: "breakfast",
            name: "",
            protein: 0,
            carbs: 0,
            sugars: 0,
        });
        setShowModal(false);
    };

    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const mealTypes = ["Breakfast", "Lunch", "Dinner"];

    return (
        <div className="main-container">
            <NavBar />
            {/* <h1 className="text-center mb-4">Mealie</h1> */}
            
            {/* Add Meal Button */}
            <div className="text-center mb-4">
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    Add Meal
                </button>
            </div>

            {/* Calendar Table */}
            <div className="calendar-table">
                <table className="table table-bordered table-hover text-center">
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
                                <td className="fw-bold text-capitalize">{mealType}</td>
                                {days.map((day) => {
                                    const meal = meals.find((m) => m.day === day) || {
                                        breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                                        lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                                        dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                                    };
                                    const mealData = meal[mealType.toLowerCase()];

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
                                                            onClick={() => handleEditMeal(meal, mealType.toLowerCase(), day)}
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
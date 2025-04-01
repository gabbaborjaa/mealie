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
        day: "",
        type: "breakfast", // Default to breakfast
        name: "",
        protein: 0,
        carbs: 0,
        sugars: 0,
    });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchMeals = async () => {
            const mealsCollection = collection(db, 'meals');
            const mealSnapshot = await getDocs(mealsCollection);
            const mealList = mealSnapshot.docs.map(doc => doc.data());
            setMeals(mealList);
        };

        fetchMeals();
    }, []);
    //     }
    //     // Placeholder for fetching meals
    //     const fetchMeals = async () => {
    //         const mealList = [
    //             {
    //                 id: "1",
    //                 day: "Monday",
    //                 breakfast: { name: "Oatmeal", protein: 5, carbs: 27, sugars: 1 },
    //                 lunch: { name: "Chicken Salad", protein: 30, carbs: 10, sugars: 5 },
    //                 dinner: { name: "Steak", protein: 40, carbs: 0, sugars: 0 },
    //             },
    //             {
    //                 id: "2",
    //                 day: "Tuesday",
    //                 breakfast: { name: "Oatmeal", protein: 5, carbs: 27, sugars: 1 },
    //                 lunch: { name: "Chicken Salad", protein: 30, carbs: 10, sugars: 5 },
    //                 dinner: { name: "Steak", protein: 40, carbs: 0, sugars: 0 },
    //             },
    //             {
    //                 id: "3",
    //                 day: "Wednesday",
    //                 breakfast: { name: "Oatmeal", protein: 5, carbs: 27, sugars: 1 },
    //                 lunch: { name: "Chicken Salad", protein: 30, carbs: 10, sugars: 5 },
    //                 dinner: { name: "Steak", protein: 40, carbs: 0, sugars: 0 },
    //             },
    //             {
    //                 id: "4",
    //                 day: "Thursday",
    //                 breakfast: { name: "Oatmeal", protein: 5, carbs: 27, sugars: 1 },
    //                 lunch: { name: "Chicken Salad", protein: 30, carbs: 10, sugars: 5 },
    //                 dinner: { name: "Steak", protein: 40, carbs: 0, sugars: 0 },
    //             },
    //             {
    //                 id: "5",
    //                 day: "Friday",
    //                 breakfast: { name: "Oatmeal", protein: 5, carbs: 27, sugars: 1 },
    //                 lunch: { name: "Chicken Salad", protein: 30, carbs: 10, sugars: 5 },
    //                 dinner: { name: "Steak", protein: 40, carbs: 0, sugars: 0 },
    //             },
    //         ];
    //         setMeals(mealList);
    //     };

    //     fetchMeals();
    // }, []);

    const handleEditMeal = (meal, type, day) => {
        setEditMeal({ ...meal[type], type, day });
        setShowEditModal(true);
    };

    // const saveMeal = () => {
    //     const updatedMeals = meals.map((meal) => {
    //         if (meal.day === editMeal.day) {
    //             return {
    //                 ...meal,
    //                 [editMeal.type]: {
    //                     name: editMeal.name,
    //                     protein: editMeal.protein,
    //                     carbs: editMeal.carbs,
    //                     sugars: editMeal.sugars,
    //                 },
    //             };
    //         }
    //         return meal;
    //     });
    //     setMeals(updatedMeals);
    //     setShowEditModal(false);
    // };

    // const deleteMeal = (day, type) => {
    //     const mealToDelete = meals.find((meal) => meal.day === day)?.[type];
    //     if (!mealToDelete || !mealToDelete.name) return; // Skip if no meal exists

    //     const confirmDelete = window.confirm("Are you sure you want to delete this meal?");
    //     if (!confirmDelete) return;

    //     const updatedMeals = meals.map((meal) => {
    //         if (meal.day === day) {
    //             return {
    //                 ...meal,
    //                 [type]: { name: "", protein: 0, carbs: 0, sugars: 0 },
    //             };
    //         }
    //         return meal;
    //     });
    //     setMeals(updatedMeals);
    // };

    const deleteMeal = async (day, type) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this meal?");
        if (!confirmDelete) return;

        const mealsCollection = collection(db, 'meals');
        const mealDoc = doc(mealsCollection,day);

        const mealSnapshot = await getDocs(mealDoc);
        if (mealSnapshot.exists()) {
            const mealData = mealSnapshot.data();
            mealData[type] = { name: "", protein: 0, carbs: 0, sugars: 0 };

            await deleteDoc(mealDoc);
        }
    };

    const addMeal = async () => {
        const mealsCollection = collection(db, 'meals');
        const mealDoc = doc(mealsCollection, newMeal.day); // Use day as document ID

        // Add a new meal
        await setDoc(mealDoc, {
            day: newMeal.day,
            breakfast: { name: "", protein: 0, carbs: 0, sugars: 0},
            lunch: { name: "", protein: 0, carbs: 0, sugars: 0},
            dinner:  { name: "", protein: 0, carbs: 0, sugars: 0},
            [newMeal.type]: {
                name: newMeal.name,
                protein: newMeal.protein,
                carbs: newMeal.carbs,
                sugars: newMeal.sugars
            },
        });

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

    const saveMeal = async () => {
        const mealsCollection = collection(db, 'meals');
        const mealDoc = doc(mealsCollection, editMeal.day);

        // 
        await setDoc(mealDoc, {
            day: editMeal.day,
            breakfast: { name: "", protein: 0, carbs: 0, sugars: 0},
            lunch: { name: "", protein: 0, carbs: 0, sugars: 0},
            dinner:  { name: "", protein: 0, carbs: 0, sugars: 0},
            [editMeal.type]: {
                name: editMeal.name,
                protein: editMeal.protein,
                carbs: editMeal.carbs,
                sugars: editMeal.sugars
            },
        });
        setShowEditModal(false);
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
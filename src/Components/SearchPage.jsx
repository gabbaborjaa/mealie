import React, { useState } from "react";
import { Button, Form, Card, Row, Col, Modal } from "react-bootstrap";
import '../Mealie.css'
const SearchPage = ({addMeal }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectRecipe, setSelectedRecipe] = useState(null);
    const [mealDetails, setMealDetails] = useState({
        day: "",
        type: "breakfast",
    });

    const fetchRecipes = async () => {
        const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch?query=${searchQuery}&number=10`;
        const options = {
            method: "GET",
            headers: {
                "x-rapidapi-key": "9954b19e67msh9b71bc271e8a464p14a5cajsne218ee7719a4",
                "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
            },
        };

        try {
            setLoading(true);
            const response = await fetch(url, options);
            const data = await response.json();
            const detailedRecipes = await Promise.all(
                data.results.map(async (recipe) => {
                    const nutritionUrl = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipe.id}/nutritionWidget.json`;
                    const nutritionResponse = await fetch(nutritionUrl, options);
                    const nutritionData = await nutritionResponse.json();
                    return {
                        ...recipe,
                        nutrition: {
                            calories: nutritionData.calories,
                            carbs: nutritionData.carbs,
                            protein: nutritionData.protein,
                            sugar: nutritionData.bad?.find((item) => item.title === "Sugar")?.amount || "N/A",
                        },
                    };
                })
            );
            setRecipes(detailedRecipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMeal = (recipe) => {
        setSelectedRecipe(recipe);
        setShowModal(true);
    };

    const handleModalSubmit = () => {
        if (!mealDetails.day || !mealDetails.type){
            alert("Please select a day and meal type");
            return;
        }

        const mealToAdd ={
            ...selectRecipe,
            day: new Date(mealDetails.day).toISOString().split("T")[0],
            type: mealDetails.type,
        };

        console.log("Submitting meal to addMeal:", mealToAdd);

        addMeal(mealToAdd);

        setShowModal(false);
        setMealDetails({ day: "", type: "breakfast"});
    };

    return (
        <div className="search-page">
            <h1>Search Recipes</h1>
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    fetchRecipes();
                }}
            >
                <Form.Group controlId="searchQuery" className="search-form">
                    <Form.Control
                        type="text"
                        placeholder="Enter a recipe name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="me-2"
                    />
                    <Button variant="primary" type="submit">
                        Search
                    </Button>
                </Form.Group>
            </Form>

            {loading && <p>Loading recipes...</p>}

            <Row className="food-card">
                {recipes.map((recipe) => (
                    <Col key={recipe.id} md={4} className="mb-4">
                        <Card>
                            <Card.Img variant="top" src={recipe.image} alt={recipe.title} />
                            <Card.Body>
                                <Card.Title>{recipe.title}</Card.Title>
                                <Card.Text>
                                    <strong>Calories:</strong> {recipe.nutrition.calories} <br />
                                    <strong>Carbs:</strong> {recipe.nutrition.carbs} <br />
                                    <strong>Protein:</strong> {recipe.nutrition.protein} <br />
                                    <strong>Sugar:</strong> {recipe.nutrition.sugar}
                                </Card.Text>
                                <Button variant="success" onClick={() => handleAddMeal(recipe)}>
                                    Add Meal
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Meal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="mealDay">
                            <Form.Label>Day</Form.Label>
                            <Form.Control
                                type="date"
                                value={mealDetails.day}
                                onChange={(e) => setMealDetails({ ...mealDetails, day: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="mealType" className="mt-3">
                            <Form.Label>Meal Type</Form.Label>
                            <Form.Select
                                value={mealDetails.type}
                                onChange={(e) => setMealDetails({ ...mealDetails, type: e.target.value })}
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleModalSubmit}>
                        Add Meal
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default SearchPage;
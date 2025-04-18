import React, { useState } from "react";
import { Button, Form, Card, Row, Col } from "react-bootstrap";
import '../Mealie.css'
const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);

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
                    const recipeUrl = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipe.id}/information`;
                    const recipeResponse = await fetch(recipeUrl, options);
                    const recipeData = await recipeResponse.json();
                    // const recipeLink = recipeData.sourceUrl;
                    // console.log("Recipe Data", recipeData)
                    // console.log("Recipe Link", recipeLink)
                    const nutritionResponse = await fetch(nutritionUrl, options);
                    const nutritionData = await nutritionResponse.json();
                    // console.log("Nutrition ID", nutritionData)
                    return {
                        ...recipe,
                        nutrition: {
                            calories: nutritionData.calories,
                            carbs: nutritionData.carbs,
                            protein: nutritionData.protein,
                            sugar: nutritionData.bad?.find((item) => item.title === "Sugar")?.amount || "N/A",
                            link: recipeData.sourceUrl,
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

    return (
        <div className="search-page">
            <h1>Search Meals</h1>
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    fetchRecipes();
                }}
            >
                <Form.Group controlId="searchQuery" className="search-form">
                    <Form.Control
                        type="text"
                        placeholder="Enter a meal..."
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
                                <Button 
                                variant="success" 
                                onClick={() => window.open(recipe.nutrition.link)}
                                >Recipe</Button> 
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default SearchPage;
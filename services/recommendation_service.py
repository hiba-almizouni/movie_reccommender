import pandas as pd

class RecommendationService:
    def __init__(self):
        movies  = pd.read_csv("models/movie_model/movies.csv")
        ratings = pd.read_csv("models/movie_model/ratings.csv")

        movie_stats = ratings.groupby("movieId").agg(
            avg_rating=("rating", "mean"),
            rating_count=("rating", "count")
        ).reset_index()

        self.movies = movies.merge(movie_stats, on="movieId")

        self.intent_genre = {
            "relaxation": "Comedy|Romance",
            "sadness": "Drama",
            "motivation": "Adventure|Action",
            "fear": "Horror",
            "happiness": "Comedy",
            "action": "Action",
            "romance": "Romance",
            "mystery": "Mystery",
            "family": "Children",
            "adventure": "Adventure",
            "science_fiction": "Sci-Fi",
            "fantasy": "Fantasy",
            "documentary": "Documentary",
            "crime": "Crime",
            "drama": "Drama",
            "animation": "Animation",
            "superhero": "Action",
            "thriller": "Thriller",
            "historical": "War",
            "comedy": "Comedy"
        }

    def recommend(self, intent: str, n: int = 10):
        if intent not in self.intent_genre:
            return []

        genre = self.intent_genre[intent]
        genres = genre.split("|")

        mask = self.movies["genres"].str.contains(genres[0], na=False)
        for g in genres[1:]:
            mask = mask | self.movies["genres"].str.contains(g, na=False)

        filtered = self.movies[mask].copy()

        if filtered.empty:
            return []

        filtered = filtered.sort_values(
            ["avg_rating", "rating_count"],
            ascending=False
        )

        return filtered[["title", "genres"]].head(n).to_dict(orient="records")
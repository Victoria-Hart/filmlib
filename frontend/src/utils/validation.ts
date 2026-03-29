export function validateMovie(form: {
  title: string;
  director: string;
  year: string;
  rating: string;
}) {
  if (!form.title || form.title.trim().length === 0) {
    return "Title is required";
  }

  if (!form.director || form.director.trim().length === 0) {
    return "Director is required";
  }

  const year = Number(form.year);

  if (
    !form.year ||
    isNaN(year) ||
    year < 1888 ||
    year > new Date().getFullYear()
  ) {
    return "Enter a valid year";
  }

  const rating = Number(form.rating);
  if (form.rating.trim() !== "") {
  const rating = Number(form.rating);

  if (isNaN(rating) || rating < 0 || rating > 10) {
    return "Rating must be between 0 and 10";
  }
}

  return null;
}
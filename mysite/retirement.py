from flask import Flask, render_template, request, jsonify
from flask import Blueprint
from openai import OpenAI
import os, re, requests
from dotenv import load_dotenv

bp = Blueprint('retirement', __name__, url_prefix='/retirement')

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


@bp.route('/', methods=['GET'])
def index():
    return render_template('retirement/index.html')

@bp.route('/api/calc', methods=['POST'])
def calculate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    # Required inputs
    try:
        current_age = int(data.get('current_age'))
        retirement_age = int(data.get('retirement_age'))
        annual_income = float(data.get('annual_income'))
        annual_spending = float(data.get('annual_spending'))
    except Exception as e:
        return jsonify({"error": "Invalid input types", "details": str(e)}), 400

    # Optional
    current_savings = float(data.get('current_savings', 0.0))
    inflation_rate = float(data.get('inflation_rate', 0.03))  # default 3%
    life_expectancy = int(data.get('life_expectancy', 100))

    # Validate logical constraints
    if retirement_age <= current_age:
        return jsonify({"error": "retirement_age must be greater than current_age"}), 400
    if any(x < 0 for x in (annual_income, annual_spending, current_savings)):
        return jsonify({"error": "Numeric inputs must be non-negative"}), 400
    if inflation_rate < 0:
        return jsonify({"error": "inflation_rate must be non-negative"}), 400
    if life_expectancy < retirement_age:
        return jsonify({"error": "life_expectancy must be >= retirement_age"}), 400

    years_left = retirement_age - current_age
    years_in_retirement = life_expectancy - retirement_age + 1

    # Build per-year projection (inflation-adjusted spending from retirement_age..life_expectancy)
    projection = []
    total_needed = 0.0
    for j in range(years_in_retirement):
        years_from_now = years_left + j
        spending_at_year = annual_spending * ((1.0 + inflation_rate) ** years_from_now)
        total_needed += spending_at_year
        projection.append({
            "age": retirement_age + j,
            "year_index": j,
            "inflation_adjusted_spending": round(spending_at_year, 2)
        })

    # Savings computations
    annual_savings = annual_income - annual_spending
    total_possible_savings = current_savings + (annual_savings * years_left)

    # monthly saving required to reach target (if still needed)
    if years_left > 0:
        remaining_needed = max(0.0, total_needed - current_savings)
        monthly_required = remaining_needed / (years_left * 12)
    else:
        monthly_required = None

    # Status and recommendation
    # ------------------- AI ADVICE -------------------
    ai_prompt = f"""
    You are a financial advisor.
    The user is {current_age} years old, wants to retire at {retirement_age}, 
    earns {annual_income} yearly, spends {annual_spending} yearly, 
    has {current_savings} in savings, and expects {inflation_rate*100}% inflation.

    Give them personalized advice and recommend ONE book in this format:
    Book: <Title> — <Author>
    Do not add extra characters, quotation marks, or Markdown around the title/author.
    """

    ai_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a financial advisor."},
                  {"role": "user", "content": ai_prompt}],
        temperature=0.7
    )

    ai_text = ai_response.choices[0].message.content.strip()

    # Extract book title & author
    book_title, book_author, cover_url = None, None, None
    match = re.search(r'Book:\s*(.+?)\s*—\s*(.+)', ai_text)


    if match:
        book_title = match.group(1).strip()
        book_author = match.group(2).strip()
        # Search Google Books API
        query = f"{book_title} {book_author}"
        url = f"https://www.googleapis.com/books/v1/volumes?q={query}"
        try:
            resp = requests.get(url, timeout=5).json()
            if "items" in resp:
                book_info = resp["items"][0]["volumeInfo"]
                cover_url = book_info.get("imageLinks", {}).get("thumbnail")
        except Exception:
            cover_url = None

    # --- Final result ---
    result = {
        "total_needed": round(total_needed, 2),
        "annual_savings": round(annual_savings, 2),
        "total_possible_savings": round(total_possible_savings, 2),
        "monthly_required": round(monthly_required, 2) if monthly_required is not None else None,
        "projection": projection,
        "ai_advice": ai_text,
        "book_title": book_title,
        "book_author": book_author,
        "cover_url": cover_url
    }

    return jsonify(result), 200

@bp.route('/results')
def results_page():
    return render_template("retirement/result.html")


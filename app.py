from flask import Flask, render_template, request, jsonify
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL", "sqlite:///quotes.db")
db.init_app(app)

class VisitorQuote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quote = db.Column(db.String(200), nullable=False)
    avatar = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()


# Homepage showing last 3 quotes
@app.route('/')
def index():
    last_quotes = VisitorQuote.query.order_by(VisitorQuote.created_at.desc()).limit(3).all()
    return render_template('index.html', quotes=last_quotes)

# Add a new quote
@app.route('/add-quote', methods=['POST'])
def add_quote():
    data = request.json
    name = data.get('name')
    quote = data.get('quote')

    # Auto-generate avatar using UI Avatars API
    avatar_url = f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=random"

    new_quote = VisitorQuote(name=name, quote=quote, avatar=avatar_url)
    db.session.add(new_quote)
    db.session.commit()

    last_quotes = VisitorQuote.query.order_by(VisitorQuote.created_at.desc()).limit(3).all()
    quotes_data = [
        {"name": q.name, "quote": q.quote, "avatar": q.avatar}
        for q in last_quotes
    ]
    return jsonify(quotes_data)



from flask import Flask, render_template, request, jsonify
from .models import db, VisitorQuote
from flask import Blueprint


bp = Blueprint('david', __name__)

# Homepage showing last 3 quotes
@bp.route('/')
def index():
    last_quotes = VisitorQuote.query.order_by(VisitorQuote.created_at.desc()).limit(3).all()
    return render_template('david/index.html', quotes=last_quotes)

# Add a new quote
@bp.route('/add-quote', methods=['POST'])
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

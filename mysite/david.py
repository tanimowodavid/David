from flask import Flask, render_template
from flask import Blueprint


bp = Blueprint('david', __name__)

# Homepage showing last 3 quotes
@bp.route('/')
def index():
    return render_template('david/index.html', home=True)


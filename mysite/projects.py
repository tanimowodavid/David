from flask import render_template
from flask import Blueprint


bp = Blueprint('projects', __name__, url_prefix='/projects')


@bp.route('/retirement')
def retirement():
    return render_template('projects/retirement.html')

@bp.route('/todo')
def todo():
    return render_template('projects/todo.html')

@bp.route('/david')
def david():
    return render_template('projects/david.html')

import os
from flask import Flask


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY = os.environ.get("SECRET_KEY", "dev"),
        SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///quotes.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from .models import db
    db.init_app(app)

    # Create tables
    with app.app_context():
        db.create_all()

    # Register Blueprints
    from . import david, retirement, projects
    app.register_blueprint(david.bp)
    app.register_blueprint(projects.bp)
    app.register_blueprint(retirement.bp)
    app.add_url_rule('/', endpoint='index')

    return app



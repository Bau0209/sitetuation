from flask import Blueprint, render_template

main = Blueprint('main', __name__)

@main.route('/')
def landingpage():
    return render_template('/main.html')
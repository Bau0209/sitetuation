from flask import Blueprint, render_template, session

main = Blueprint('main', __name__)

@main.route('/')
def landingpage():
    current_plan = session.get('plan', 'free')
    return render_template('main.html', current_plan=current_plan)

@main.route('/plans')
def plans():
    current_plan = session.get('plan', 'free')
    return render_template('plans_and_credits.html', current_plan=current_plan)
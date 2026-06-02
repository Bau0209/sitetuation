from flask import Blueprint, render_template, session, redirect, url_for

main = Blueprint('main', __name__)

def get_username():
    return session.get('username')

def get_plan():
    plan = session.get('plan')
    if plan is None:
        plan = 'free_trial' if session.get('username') else 'guest'
        session['plan'] = plan
    return plan

@main.route('/')
def landingpage():
    return render_template('landing.html', current_plan=get_plan(), username=get_username())

@main.route('/main')
def plans():
    username = get_username()
    return render_template('main.html', current_plan=get_plan(), username=username)

@main.route('/plans')
def plans_and_credits():
    return render_template('plans_and_credits.html', current_plan=get_plan(), username=get_username())
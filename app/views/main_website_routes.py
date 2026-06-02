from flask import Blueprint, render_template, session, redirect, url_for
from ..models import Account

main = Blueprint('main', __name__)

def get_current_user():
    username = session.get('username')
    if not username:
        return None
    return Account.query.filter_by(username=username).first()

def get_username():
    user = get_current_user()
    return user.username if user else None

def get_plan():
    user = get_current_user()

    if not user:
        return 'free'

    return user.plan or 'free'

@main.route('/')
def landingpage():
    return render_template(
        'landing.html',
        current_plan=get_plan(),
        username=get_username()
    )

@main.route('/main')
def plans():
    print(get_plan())
    return render_template(
        'main.html',
        current_plan=get_plan(),
        username=get_username()
    )

@main.route('/plans')
def plans_and_credits():
    return render_template(
        'plans_and_credits.html',
        current_plan=get_plan(),
        username=get_username()
    )
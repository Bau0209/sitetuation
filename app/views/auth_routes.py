from flask import Blueprint, render_template, session, request, redirect, url_for
from app import db
from app.models import Account

auth = Blueprint('auth', __name__)

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

# LOGIN
@auth.route('/login', methods=['GET', 'POST'])
def login():
    if get_username():
        return redirect(url_for('main.plans'))

    error = None

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        if not username or not password:
            error = 'Please enter both username and password.'
        else:
            user = Account.query.filter_by(username=username).first()

            if not user or user.password != password:
                error = 'Invalid username or password.'
            else:
                session['username'] = user.username
                session['plan'] = user.plan or 'free'
                return redirect(url_for('main.plans'))

    return render_template(
        'login.html',
        error=error,
        current_plan=get_plan(),
        username=get_username()
    )

# REGISTER
@auth.route('/register', methods=['GET', 'POST'])
def register():
    if get_username():
        return redirect(url_for('main.plans'))

    error = None

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        if not username or not password or not confirm_password:
            error = 'Please complete all fields.'
        elif password != confirm_password:
            error = 'Passwords do not match.'
        else:
            existing_user = Account.query.filter_by(username=username).first()

            if existing_user:
                error = 'That username is already taken.'
            else:
                new_user = Account(username=username, password=password)
                db.session.add(new_user)
                db.session.commit()

                session['username'] = username
                session['plan'] = new_user.plan or 'free'
                return redirect(url_for('main.plans'))

    return render_template(
        'register.html',
        error=error,
        current_plan=get_plan(),
        username=get_username()
    )

# LOGOUT
@auth.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('plan', None)
    return redirect(url_for('main.landingpage'))
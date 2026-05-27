from flask import Blueprint, render_template, session, request, redirect, url_for

main = Blueprint('main', __name__)

# Temporary in-memory user store for demo purposes.
users = {
    'admin': 'admin123',
    'user': 'password'
}

def get_username():
    return session.get('username')

def get_plan():
    return session.get('plan', 'free')

@main.route('/')
def landingpage():
    return render_template('landing.html', current_plan=get_plan(), username=get_username())

@main.route('/main')
def plans():
    username = get_username()
    if not username:
        return redirect(url_for('main.login'))
    return render_template('main.html', current_plan=get_plan(), username=username)

@main.route('/plans')
def plans_and_credits():
    return render_template('plans_and_credits.html', current_plan=get_plan(), username=get_username())

@main.route('/login', methods=['GET', 'POST'])
def login():
    if get_username():
        return redirect(url_for('main.plans'))

    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        if not username or not password:
            error = 'Please enter both username and password.'
        elif username not in users or users[username] != password:
            error = 'Invalid username or password.'
        else:
            session['username'] = username
            session.setdefault('plan', 'free')
            return redirect(url_for('main.plans'))

    return render_template('login.html', error=error, current_plan=get_plan(), username=get_username())

@main.route('/register', methods=['GET', 'POST'])
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
        elif username in users:
            error = 'That username is already taken.'
        elif password != confirm_password:
            error = 'Passwords do not match.'
        else:
            users[username] = password
            session['username'] = username
            session.setdefault('plan', 'free')
            return redirect(url_for('main.plans'))

    return render_template('register.html', error=error, current_plan=get_plan(), username=get_username())

@main.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('plan', None)
    return redirect(url_for('main.landingpage'))
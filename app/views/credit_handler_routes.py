from flask import Blueprint, render_template, session, request, jsonify
from ..models import Account, db

credit_handler = Blueprint('credit_handler', __name__)

def get_current_user():
    username = session.get('username')
    if not username:
        return None
    return Account.query.filter_by(username=username).first()

def get_username():
    user = get_current_user()
    return user.username if user else None

@credit_handler.route('/deduct_credits', methods=['POST'])
def deduct_credits():
    username = get_username()

    if not username:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    account = Account.query.filter_by(username=username).first()

    if not account:
        return jsonify({'success': False, 'message': 'Account not found'}), 404
    
    if account.credits < 50:
        return jsonify({'success': False, 'message': 'Insufficient credits'}), 400

    account.credits -= 50
    db.session.commit()

    return jsonify({
        'success': True,
        'credits': account.credits
    })

@credit_handler.route('/add_credits', methods=['POST'])
def add_credits():
    username = session.get('username')

    if not username:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401

    data = request.get_json()
    additional_credits = data.get('credits', 0)

    account = Account.query.filter_by(username=username).first()

    if not account:
        return jsonify({'success': False, 'message': 'Account not found'}), 404

    account.credits += additional_credits
    db.session.commit()

    return jsonify({
        'success': True,
        'credits': account.credits
    })

@credit_handler.route('/update_plan', methods=['POST'])
def update_plan():
    username = session.get('username')

    if not username:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401

    data = request.get_json()
    plan = data.get('plan')

    # SECURITY: server decides plan rewards
    plan_credits = {
        "free": 0,
        "plus": 650,
        "pro": 2000
    }

    account = Account.query.filter_by(username=username).first()

    if not account:
        return jsonify({'success': False, 'message': 'Account not found'}), 404

    account.plan = plan

    # OPTIONAL: give credits on upgrade
    account.credits += plan_credits.get(plan, 0)

    db.session.commit()

    return jsonify({
        'success': True,
        'plan': account.plan,
        'credits': account.credits
    })
from flask import Blueprint, render_template, session, jsonify
from ..models import Account, db


credit_handler = Blueprint('credit_handler', __name__)

@credit_handler.route('/deduct_credits', methods=['POST'])
def deduct_credits():
    username = session.get('username')

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
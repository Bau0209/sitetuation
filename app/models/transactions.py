from . import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False) # examples: "plan_purchase", "credit_purchase", "credit_deduction"
    plan = db.Column(db.String(20)) # optional plan name (if plan purchase)
    credits_change = db.Column(db.Integer, default=0)
    amount_php = db.Column(db.Float)
    payment_method = db.Column(db.String(50)) # credit-card, mobile-wallet, bank-transfer
    status = db.Column(db.String(20), default="completed") # completed, pending, failed, refunded
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign Key
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    account = db.relationship('Account', backref='transactions')
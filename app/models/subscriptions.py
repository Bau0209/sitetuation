from . import db
from datetime import datetime

class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id = db.Column(db.Integer, primary_key=True)
    plan = db.Column(db.String(20), nullable=False) # free, plus, pro
    status = db.Column(db.String(20), nullable=False, default="active") # active, canceled, expired
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ends_at = db.Column(db.DateTime)

    # Foreign Key
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    account = db.relationship('Account', backref='subscriptions')
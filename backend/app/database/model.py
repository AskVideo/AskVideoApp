from app.database.db_init import db

class User(db.Model):
    __tablename__ = 'user'
    id=db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(80))

    def __init__(self, name):
        self.name=name

    def __repr__(self):
        return '<User(name: %r)> ' % (self.name)
    
    def create_user(self):
        db.session.add(self)
        db.session.commit()

    @staticmethod
    def get_users():
        return User.query.all()
from flask import request, jsonify
from app.video_bp import bp
from app.database.model import User, Sessions, SessionContent, Video, MainFunc
from app import converter

@bp.route("/search", methods=['POST'])
def search():
    data = request.json
    query = data['query']
    result = converter.search_yt(query=query, k=5)
    response = { "code" : 200, 
                "msg" : "Search results",
                "data" : result
        } 
    return jsonify(response)
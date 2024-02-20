from flask import request, jsonify
from app.video_bp import bp
from app.database.model import User, Sessions, SessionContent, Video, MainFunc
from app import converter

@bp.route("/search", methods=['POST'])
def search():
    data = request.json
    query = data['query']
    result = converter.search_yt(query=query, k=4)
    response = { "code" : 200, 
                "msg" : "Search results",
                "data" : result
        } 
    return jsonify(response)

@bp.route("/video/details/<video_id>", methods=['GET'])
def get_video_details(video_id):
    video_details = {
        "title": "Sample Video Title",
        "url": f"https://youtube.com/watch?v={video_id}",
        "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/0.jpg"
    }
    return jsonify(video_details)
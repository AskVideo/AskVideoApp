from flask import request, jsonify
from app.video_bp import bp
from app import converter
import json

@bp.route("/search", methods=['POST'])
def search():
    data = request.get_data()
    args = json.loads(data)
    response = converter.search_yt(query=args["query"], k=4)
    return jsonify(response)

@bp.route("/details/<string:video_id>", methods=['POST'])
def get_video_details(video_id):
    transcript = converter.video_to_text("https://youtube.com/watch?v={video_id}".format(video_id=video_id), video_id=video_id)
    video_details = {
        "title": "Sample Video Title",
        "url": f"https://youtube.com/watch?v={video_id}",
        "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/0.jpg",
        "transcript": transcript
    }
    return jsonify(video_details)
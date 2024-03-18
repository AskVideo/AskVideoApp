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

@bp.route("/preprocess", methods=['POST'])
def preprocess():
    data = request.get_data()
    args = json.loads(data)
    response = converter.preprocess(args)
    return response

@bp.route("/ask", methods=['POST'])
def ask():
    data = request.get_data()
    args = json.loads(data)
    response = converter.preprocess(args)
    return response
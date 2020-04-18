from flask import Flask, render_template, make_response, send_from_directory, Response, json, request, redirect, \
    jsonify, send_file
from flask_cors import CORS
from ui import app

from random import randint

import sys

cors = CORS(app, resources={r"*": {"origins": "*"}})


# Render index.html initially
@app.route('/hangman')
def render_index():
    return render_template('index.html')


# Render stylings
@app.route('/css/style.css', methods=["GET"])
def render_style():
    try:
        response = make_response(render_template('css/style.css'))
        response.headers['Content-type'] = "text/css; charset=utf-8"
        return response
    except Exception as e:
        print("\033[93m" + str(e) + "\033[0m")
        return 'OK'


@app.route('/hangman/new-game', methods=["POST"])
def new_game():
    try:
        game_id = randint(000000000, 999999999)
        response = {
            "game_id": game_id,
        }

        return json.dumps(response), 200, {"Content-Type": "application/json"}
    except:
        print("Unexpected error:", sys.exc_info())
    return json.dumps({"message": "ERROR"}), 500, {"Content-Type": "application/json"}

@app.route('/hangman/submit-guess', methods=["PUT"])
def submit_guess():
    try:
        game_id = request.args.get('game_id')
        response = {
            "game_id": game_id,
            "guesses": {
                "num_guesses_left": 8,
                "num_total_guesses": 10,
                "num_guesses_used": 2
            },
            "status": {
                "total_chars": 7,
                "word": ["", "A", "", "", "", "A", ""],
                "wrong_guesses": ['B', 'C']
            },
            "game_over": "false"

        }

        return json.dumps(response), 200, {"Content-Type": "application/json"}
    except:
        print("Unexpected error:", sys.exc_info())
    return json.dumps({"message": "ERROR"}), 500, {"Content-Type": "application/json"}


@app.route('/hangman/game-status', methods=["GET"])
def game_status():
    try:
        game_id = request.args.get('game_id')

        response = {
            "game_id": game_id,
            "guesses": {
                "num_guesses_left": 10,
                "num_total_guesses": 10,
                "num_guesses_used": 0
            },
            "status": {
                "total_chars": 7,
                "word": ["", "A", "", "", "", "A", ""],
                "wrong_guesses": ['B', 'C']
            }

        }

        return json.dumps(response), 200, {"Content-Type": "application/json"}
    except:
        print("Unexpected error:", sys.exc_info())
    return json.dumps({"message": "ERROR"}), 500, {"Content-Type": "application/json"}


@app.route('/<path:path>')
def render_path(path):
    if 'hangman' in path:
        path = path.split("hangman/")[1]
    if ".js" in path or "i18n" in path or "favicon" in path or ".json" in path or ".css" in path:
        return send_from_directory('templates', path)
    elif ".xml" in path:
        return render_template(path)
    else:
        return render_template('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)

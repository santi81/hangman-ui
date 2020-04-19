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

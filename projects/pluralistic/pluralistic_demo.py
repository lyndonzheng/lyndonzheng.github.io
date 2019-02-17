from flask import Flask

app = Flask(__name__)


@app.route('/pluralistic_demo')
def pluralistic_demo():
    return "Hello Word"


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)


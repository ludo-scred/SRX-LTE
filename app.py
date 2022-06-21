import signal
import xml.parsers.expat
import requests.exceptions
import urllib3.exceptions
from huawei_lte_api.Client import Client
from huawei_lte_api.Connection import Connection
import huawei_lte_api.exceptions
import json
import logging
import sys
import time
from datetime import datetime
from typing import Iterator
import webbrowser
from threading import Timer
import os
from flask import Flask, Response, render_template, request, stream_with_context, send_from_directory, jsonify
import configparser
import speedtestpy
import render_excel
import email_sender


logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

application = Flask(__name__, static_folder='static')


def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000/')


def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()


@application.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(application.root_path, 'static'), 'favicon.ico',
                               mimetype='image/vnd.microsoft.icon')


@application.route('/resetPassword', methods=['POST'])
def reset_password():
    login = request.values["login"]
    pwd = request.values["pwd"]
    ip = request.values["ip"]
    update_conf(login, pwd, ip)
    return index()


@application.route("/")
def index() -> str:
    try:
        is_connected = try_airbox_login()
        error = ""
        if "OK" in is_connected:
            return render_template("index.html")
        if "password" in is_connected:
            error = "Connexion impossible à la Airbox. Mot de passe incorrect." \
                        " Veuillez mettre à jour les informations."
        if "ip" in is_connected:
            error = "Connexion impossible à la Airbox. Adresse IP introuvable. " \
                       "Veuillez mettre à jour les informations."
        if "overrun" in is_connected:
            error = "Connexion impossible à la Airbox. Trop de tentatives infructueuses." \
                    "Veuillez redémarrer la Airbox."
        if "router" in is_connected:
            error = "Connexion impossible à la Airbox. Un autre routeur ayant la même IP est " \
                    "déjà sur le réseau."
    except TypeError:
        error = "Connexion impossible à la Airbox. " \
                "Veuillez vous assurer qu'elle est bien connectée et allumée."
    config = configparser.RawConfigParser()
    config.read('airbox.cfg')
    details_dict = dict(config.items('DETAILS'))
    login = details_dict["login"]
    pwd = details_dict["password"]
    ip = details_dict["ip_addr"]
    return render_template("resetPassword.html", login=login, pwd=pwd, ip=ip, error=error)


def update_conf(login, pwd, ip):
    config = configparser.RawConfigParser()
    config.read('airbox.cfg')
    config.set('DETAILS', 'ip_addr', ip)
    config.set('DETAILS', 'login', login)
    config.set('DETAILS', 'password', pwd)
    with open('airbox.cfg', 'w') as configfile:
        config.write(configfile)


def send_data() -> Iterator[str]:
    l_rsrp = []
    l_rsrq = []
    l_rssi = []
    l_sinr = []
    l_margin = []
    if request.headers.getlist("X-Forwarded-For"):
        client_ip = request.headers.getlist("X-Forwarded-For")[0]
    else:
        client_ip = request.remote_addr or ""

    try:
        logger.info("Client %s connected", client_ip)

        while True:
            jsond = get_data()
            rssi = jsond["rssi"][:-3]
            rsrp = jsond["rsrp"][:-3]
            rsrq = jsond["rsrq"][:-2]
            sinr = jsond["sinr"][:-2]
            rf_margin = get_rf_margin(abs(int(rsrp)), abs(int(float(rsrq))), abs(int(sinr)))
            l_rsrp.append(int(rsrp))
            l_rsrq.append(float(rsrq))
            l_rssi.append(int(rssi))
            l_sinr.append(int(sinr))
            l_margin.append(int(rf_margin))
            ms_ping = ping_google()[:-2]
            json_data = json.dumps(
                {
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "rsrp": rsrp,
                    "rsrp_min": get_min_max(l_rsrp)[1],
                    "rsrp_max": get_min_max(l_rsrp)[0],
                    "rsrp_avg": get_average(l_rsrp),
                    "rssi": rssi,
                    "rssi_min": get_min_max(l_rssi)[1],
                    "rssi_max": get_min_max(l_rssi)[0],
                    "rssi_avg": get_average(l_rssi),
                    "rsrq": rsrq,
                    "rsrq_min": get_min_max(l_rsrq)[1],
                    "rsrq_max": get_min_max(l_rsrq)[0],
                    "rsrq_avg": get_average(l_rsrq),
                    "sinr": sinr,
                    "sinr_min": get_min_max(l_sinr)[0],
                    "sinr_max": get_min_max(l_sinr)[1],
                    "sinr_avg": get_average(l_sinr),
                    "rf_margin": rf_margin,
                    "rf_margin_min": get_min_max(l_margin)[0],
                    "rf_margin_max": get_min_max(l_margin)[1],
                    "rf_margin_avg": get_average(l_margin),
                    "ping_google": round(int(ms_ping))
                }
            )
            yield f"data:{json_data}\n\n"
            time.sleep(0.2)
    except GeneratorExit:
        logger.info("Client %s disconnected", client_ip)


@application.route("/chart-data")
def chart_data() -> Response:
    response = Response(stream_with_context(send_data()), mimetype="text/event-stream")
    response.headers["Cache-Control"] = "no-cache"
    response.headers["X-Accel-Buffering"] = "no"
    return response


@application.route('/speedtest', methods=['GET'])
def speed_test():
    st = get_speedtest()
    rsrp = request.args.get('rsrp')
    rsrq = request.args.get('rsrq')
    rssi = request.args.get('rssi')
    sinr = request.args.get('sinr')
    rfm = request.args.get('rfm')
    ping = request.args.get('ping')
    data = {"rsrp": rsrp, "rsrq": rsrq, "rssi": rssi, "sinr": sinr, "ping": ping, "rfm": rfm, "dl": st["dl"],
            "up": st["up"]}
    with open('signal.json', 'w') as outfile:
        json.dump(data, outfile)
    return st


@application.get('/shutdown')
def stopServer():
    os.kill(os.getpid(), signal.SIGINT)
    return jsonify({"success": True, "message": "Server is shutting down..." })


@application.route('/average', methods=['GET'])
def get_average_and_write_to_excel():
    arsrp = request.args.get('arsrp')
    arsrq = request.args.get('arsrq')
    arssi = request.args.get('arssi')
    asinr = request.args.get('asinr')
    with open('signal.json') as json_file:
        data = json.load(json_file)
        rsrp = data["rsrp"]
        rsrq = data["rsrq"]
        rssi = data["rssi"]
        sinr = data["sinr"]
        rfm = data["rfm"]
        ping = data["ping"]
        dl = data["dl"]
        up = data["up"]
        render_excel.create_excel(rsrp, arsrp, rsrq, arsrq, rssi, arssi, sinr, asinr, rfm, ping, dl, up)
        email_sender.send_mail("Speedtest done")
    os.remove("signal.json")
    return "Speedtest done"



def get_speedtest():
    dl = speedtestpy.data.download()
    up = speedtestpy.data.upload()
    return {"dl": dl, "up": up}


def get_data():
    config = configparser.RawConfigParser()
    config.read('airbox.cfg')
    details_dict = dict(config.items('DETAILS'))
    with Connection(f'http://{details_dict["login"]}:{details_dict["password"]}@{details_dict["ip_addr"]}') \
            as connection:
        client = Client(connection)
        json = client.device.signal()
        return json


def get_rf_margin(rsrp, rsrq, sinr):
    rsrp_max = 80
    rsrp_min = 100
    rsrq_max = 10
    rsrq_min = 20
    sinr_max = 20
    sinr_min = 0
    perc_list = []
    if rsrp <= 80:
        perc_list.append(100)
    else:
        perc_list.append(magic_formula(rsrp, rsrp_min, rsrp_max))
    if rsrq <= 10:
        perc_list.append(100)
    else:
        perc_list.append(magic_formula(rsrq, rsrq_min, rsrq_max))
    if sinr >= 20:
        perc_list.append(100)
    else:
        perc_list.append(magic_formula(sinr, sinr_min, sinr_max))
    return get_average(perc_list)


def magic_formula(actual, min, max):
    a = (actual-min)/(max-min)
    b = a*100
    return round(b)


def get_average(list):
    res = sum(list)
    avg = res / len(list)
    return round(avg)


def get_min_max(record):
    return min(record), max(record)


def ping_google():
    ping = os.popen('ping 8.8.8.8 -n 1')
    result = ping.readlines()
    msLine = result[-1].strip()
    return msLine.split(' = ')[-1]

def check_if_conf_exists():
    try:
        file = open("airbox.cfg", 'r')
    except IOError:
        with open("airbox.cfg", 'w') as f:
            f.write('[DETAILS]\nip_addr = 192.168.1.1\nlogin = admin\npassword = Cegedim1')


def try_airbox_login():
    check_if_conf_exists()
    config = configparser.RawConfigParser()
    config.read('airbox.cfg')
    details_dict = dict(config.items('DETAILS'))
    ping = os.popen(f'ping {details_dict["ip_addr"]} -n 1')
    result = ping.readlines()
    msLine = result[-1].strip().split(' = ')[-1]
    if "ms" in msLine:
        pass
    else:
        return "ip"
    if __name__ == '__main__':
        try:
            with Connection(f'http://{details_dict["login"]}:{details_dict["password"]}@{details_dict["ip_addr"]}') \
                    as connection:
                Client(connection)
                return "OK"
        except huawei_lte_api.exceptions.LoginErrorUsernamePasswordWrongException:
            return "password"
        except huawei_lte_api.exceptions.LoginErrorUsernamePasswordOverrunException:
            return "overrun"
        except KeyError:
            return "router"
        except xml.parsers.expat.ExpatError:
            return "router"
        except urllib3.exceptions.MaxRetryError:
            return "ip"
        except requests.exceptions.ConnectTimeout:
            return "ip"
        except requests.exceptions.ConnectionError:
            return "ip"


Timer(1, open_browser).start()
application.run(port=5000)

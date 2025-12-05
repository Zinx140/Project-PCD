from flask import Flask, render_template, request, send_file
import cv2, numpy as np, io

app = Flask(__name__)
processed_image = None    # cache gambar di RAM

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/process", methods=["POST"])
def process():
    global processed_image

    file = request.files.get("image")
    if not file:
        return "Tidak ada file!"

    # convert file ke OpenCV image
    img_np = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    # --- CONTOH PROSES GAMBAR ---
    processed = cv2.Canny(img, 50, 120)   # edge detection
    # ---------------------------------

    # simpan hasil di memory
    _, buffer = cv2.imencode(".png", processed)
    processed_image = buffer.tobytes()

    # kembali ke halaman utama, image otomatis update
    return render_template("index.html", updated=True)

@app.route("/output")
def output():
    if processed_image is None:
        return "Belum ada gambar hasil!"
    return send_file(io.BytesIO(processed_image), mimetype="image/png")

app.run(debug=True)

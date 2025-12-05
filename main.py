import cv2 as cv

img = cv.imread('img/12.jpg')
# img = cv.imread('img/7.jpeg')

gray_img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

blurred_img = cv.GaussianBlur(gray_img, (7, 7), 0)
_, thresh_img = cv.threshold(blurred_img, 38, 255, cv.THRESH_BINARY_INV)
contours, hirearchy = cv.findContours(thresh_img, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

for cnt in contours:
    area = cv.contourArea(cnt)
    if area > 5500:
        x1, y1, w, h = cv.boundingRect(cnt)
        if w > h:

            monitor_roi = img[y1:y1+h, x1:x1+w]
            roi_gray = cv.cvtColor(monitor_roi, cv.COLOR_BGR2GRAY)
            mean_brightness = cv.mean(roi_gray)[0]
            black_threshold = 70

            status = "UNKNOWN"
            color_status = (0, 0, 0)

            if mean_brightness < black_threshold:
                status = "MATI (OFF)"
                color_status = (0, 0, 255) # Merah
            else:
                status = "MENYALA (ON)"
                color_status = (0, 255, 0) # Hijau

            cv.rectangle(img, (x1, y1), (x1 + w, y1 + h), color_status, 2)
            
            label = f"{status} | Val: {int(mean_brightness)}"
            cv.putText(img, label, (x1, y1 - 10), 
                       cv.FONT_HERSHEY_SIMPLEX, 0.6, color_status, 2)
            
            print(f'Area: {area}, Brightness: {mean_brightness:.2f}, Status: {status}')

# cv.imshow('Image', img)
cv.waitKey(0)
cv.destroyAllWindows()


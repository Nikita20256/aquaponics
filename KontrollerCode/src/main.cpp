#include "mbed.h"
#include "BME280.h"
#include "OPT3001.h"
#include "TCPSocket.h"
#include "MQTTClientMbedOs.h"
#include "VL6180.h"

// Реле насаоса\воздуха\света
DigitalOut ReleVoda(D7);
DigitalOut ReleVozdyx(D5);
DigitalOut ReleSvet(D6);

// Датчик освящённости
VL6180 rf(I2C_SDA, I2C_SCL);

// Интерфейс Wi-Fi
WiFiInterface *wifi;

//Датчик света OPT3001
OPT3001 sensor_opt(I2C_SDA, I2C_SCL);

// Светодиод для индикации
DigitalOut led(LED1);

// Датчик влажности
 AnalogIn soilMoisture(A0);

 DigitalIn myVoda(D4);



// Настройки MQTT
const char* hostname = "213.171.15.35";
int port = 1883;
const char* temperatureTopic = "aquaponics/temperature";
const char* humidityTopic = "aquaponics/humidity";
const char* suetTopic = "aquaponics/dev1/light";
const char* vlagaTopic = "aquaponics/dev1/humidity";
const char* YrVodTopic = "aquaponics/dev1/water";
const char* VklSvet = "aquaponics/dev1/VklSvet";



void mqtt_demo(NetworkInterface *net) {
    TCPSocket socket;
    MQTTClient client(&socket);

    // Подключение к брокеру
    SocketAddress a;
    net->gethostbyname(hostname, &a);
    a.set_port(port);
    printf("Подключение к %s:%d\r\n", hostname, port);

    int rc = socket.open(net);
    if (rc != 0) {
        printf("Ошибка открытия сокета: %d\r\n", rc);
        return;
    }

    rc = socket.connect(a);
    if (rc != 0) {
        printf("Ошибка TCP-подключения: %d\r\n", rc);
        return;
    }

    // Настройка MQTT-соединения
    MQTTPacket_connectData data = MQTTPacket_connectData_initializer;
    data.MQTTVersion = 4;
    data.clientID.cstring = const_cast<char*>("nucleo_temp_sensor");
    data.username.cstring = const_cast<char*>("device1");
    data.password.cstring = const_cast<char*>("aqua");

    rc = client.connect(data);
    if (rc != 0) {
        printf("Ошибка подключения MQTT: %d\r\n", rc);
        return;
    }
    printf("MQTT подключен\r\n");

    // Основной цикл
    MQTT::Message message;
    char buf[100];
    char buf2[100];
    char buf3[100];  
    char buf4[100];  
    int x = 0; 
    int z = 0;
    myVoda.mode(PullUp);

    while (true) {

        // Публикация света
        float suet = sensor_opt.readSensor();
        sprintf(buf, "%.0f", suet);
        printf("Свет: %.2f ", suet);
        message.payload = (void*)buf;
        message.payloadlen = strlen(buf) + 1;
        rc = client.publish(suetTopic, message);
        if (rc != 0) {
            printf("Ошибка публикации света: %d\r\n", rc);
        } else {
            printf("Отправлен свет: %s\r\n", buf);
        }   
        
        // Публикация влажности
        float moisture = soilMoisture.read();
        float fixMoisture = moisture*100;

        sprintf(buf2, "%.0f", fixMoisture);
        printf("Влажность: %2.2f ", fixMoisture);
        message.payload = (void*)buf2;
        message.payloadlen = strlen(buf2) + 1;
        rc = client.publish(vlagaTopic, message);
        if (rc != 0) {
            printf("Ошибка публикации влажности: %d\r\n", rc);
        } else {
            printf("Отправлена влажность: %s\r\n", buf2);
        }   
        
        // Публикация уровня воды
        float YrVod = myVoda.read();
        sprintf(buf3, "%.0f", YrVod);
        printf("Уровень воды: %2.2f ", YrVod);
        message.payload = (void*)buf3;
        message.payloadlen = strlen(buf3) + 1;
        rc = client.publish(YrVodTopic, message);
        if (rc != 0) {
            printf("Ошибка публикации уровня воды: %d\r\n", rc);
        } else {
            printf("Отправлен уровень воды: %s\r\n", buf3);
        }

        //Включение света
        if (suet < 150){
            ReleSvet = 0;
        } else {
            ReleSvet = 1;
        }

        //Включение насоса для почвы
         if (fixMoisture >= 50  ){
            ReleVoda = 1;
         } else {
            ReleVoda = 0;
            //Счётчик включений насоса
            float Schet = 1;
            sprintf(buf4, "%.0f", Schet);
            printf("Счёт: %2.2f\r\n ", Schet);
            message.payload = (void*)buf4;
            message.payloadlen = strlen(buf4) + 1;
            rc = client.publish(VklSvet, message);

            if (rc != 0) {
                printf("Ошибка публикации Счёт: %d\r\n", rc);
            } else {
                 printf("Отправлен Счёт: %s\r\n", buf4);
            }

         }    
         //Включение Аэрации
         if (x < 180){
             ReleVozdyx = 1;
            x += 1; 
            //z = 0;   
         }
         else if (x >= 180 & x < 360) {
            ReleVozdyx = 0;
            x += 1;
         } else {
            x = 0;
         }

        // Мигаем светодиодом для индикации
        led = !led;
        ThisThread::sleep_for(10s); // Отправляем данные каждые 5 секунд
        client.yield(100); // Обрабатываем входящие сообщения (если нужно)
    }
}



int main() {

    // Инициализация Wi-Fi
    wifi = WiFiInterface::get_default_instance();
    if (!wifi) {
        printf("ОШИБКА: WiFi-интерфейс не найден.\n");
        return -1;
    }

    // Подключение к Wi-Fi
    printf("Подключение к %s...\n", MBED_CONF_APP_WIFI_SSID);
    int ret = wifi->connect(MBED_CONF_APP_WIFI_SSID, MBED_CONF_APP_WIFI_PASSWORD, NSAPI_SECURITY_WPA_WPA2);
    if (ret != 0) {
        printf("Ошибка подключения к WiFi: %d\n", ret);
        return -1;
    }

    SocketAddress ip;
    wifi->get_ip_address(&ip);
    printf("WiFi подключен\n");
    printf("IP: %s\n", ip.get_ip_address() ? ip.get_ip_address() : "Не удалось получить IP");

    // Запуск MQTT
     mqtt_demo(wifi);

    wifi->disconnect();
    printf("Готово\n");
    return 0;

}


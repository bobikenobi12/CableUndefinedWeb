import * as wokwiElements from "@b.borisov/cu-elements";

type WokwiElementsMapping = {
	[key: string]: HTMLElement;
};

const partMappings: WokwiElementsMapping = {
	"Analog Joystick": new wokwiElements.AnalogJoystickElement(),
	"Arduino Mega": new wokwiElements.ArduinoMegaElement(),
	"Arduino Nano": new wokwiElements.ArduinoNanoElement(),
	"Arduino Uno": new wokwiElements.ArduinoUnoElement(),
	"Big Sound Sensor": new wokwiElements.BigSoundSensorElement(),
	"Biaxial Stepper": new wokwiElements.BiaxialStepperElement(),
	"MCU Breadboard": new wokwiElements.McuBreadboardElement(),
	"Main Breadboard": new wokwiElements.MainBreadboardElement(),
	Buzzer: new wokwiElements.BuzzerElement(),
	DHT22: new wokwiElements.Dht22Element(),
	"DIP Switch 8": new wokwiElements.DipSwitch8Element(),
	DS1307: new wokwiElements.Ds1307Element(),
	"ESP32 Devkit V1": new wokwiElements.ESP32DevkitV1Element(),
	"Flame Sensor": new wokwiElements.FlameSensorElement(),
	Franzininho: new wokwiElements.FranzininhoElement(),
	"Gas Sensor": new wokwiElements.GasSensorElement(),
	"HC-SR04": new wokwiElements.HCSR04Element(),
	"Heart Beat Sensor": new wokwiElements.HeartBeatSensorElement(),
	HX711: new wokwiElements.HX711Element(),
	ILI9341: new wokwiElements.ILI9341Element(),
	"IR Receiver": new wokwiElements.IRReceiverElement(),
	"IR Remote": new wokwiElements.IRRemoteElement(),
	"KY-040": new wokwiElements.KY040Element(),
	LCD1602: new wokwiElements.LCD1602Element(),
	LCD2004: new wokwiElements.LCD2004Element(),
	"LED Bar Graph": new wokwiElements.LedBarGraphElement(),
	"LED Ring": new wokwiElements.LEDRingElement(),
	LED: new wokwiElements.LEDElement(),
	"Membrane Keypad": new wokwiElements.MembraneKeypadElement(),
	"MicroSD Card": new wokwiElements.MicrosdCardElement(),
	MPU6050: new wokwiElements.MPU6050Element(),
	"Nano RP2040 Connect": new wokwiElements.NanoRP2040ConnectElement(),
	"NeoPixel Matrix": new wokwiElements.NeopixelMatrixElement(),
	NeoPixel: new wokwiElements.NeoPixelElement(),
	"NTC Temperature Sensor": new wokwiElements.NTCTemperatureSensorElement(),
	"Photoresistor Sensor": new wokwiElements.PhotoresistorSensorElement(),
	"PIR Motion Sensor": new wokwiElements.PIRMotionSensorElement(),
	Potentiometer: new wokwiElements.PotentiometerElement(),
	Pushbutton: new wokwiElements.PushbuttonElement(),
	Resistor: new wokwiElements.ResistorElement(),
	"RGB LED": new wokwiElements.RGBLedElement(),
	"Rotary Dialer": new wokwiElements.RotaryDialerElement(),
	Servo: new wokwiElements.ServoElement(),
	"Seven Segment": new wokwiElements.SevenSegmentElement(),
	"Slide Potentiometer": new wokwiElements.SlidePotentiometerElement(),
	"Slide Switch": new wokwiElements.SlideSwitchElement(),
	"Small Sound Sensor": new wokwiElements.SmallSoundSensorElement(),
	SSD1306: new wokwiElements.SSD1306Element(),
	"Stepper Motor": new wokwiElements.StepperMotorElement(),
	"Show Pins": new wokwiElements.ShowPinsElement(),
	"Tilt Switch": new wokwiElements.TiltSwitchElement(),
};

const partTagsToConnectionStrings: Record<string, string> = {
	"wokwi-main-breadboard": "MAIN",
	"wokwi-mcu-breadboard": "MCU",
};

export { partMappings, partTagsToConnectionStrings };

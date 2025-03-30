"use client";

import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plane, Car, Truck, Zap, Droplet, AlertCircle } from "lucide-react";

interface CarbonResults {
  carbon_kg: number;
  distance_value?: number;
  distance_unit?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  weight_value?: number;
  weight_unit?: string;
  electricity_value?: number;
  electricity_unit?: string;
  country?: string;
  state?: string;
  fuel_source_value?: number;
  fuel_source_unit?: string;
  fuel_source_type?: string;
}

export default function TracePage() {
  const [activeTab, setActiveTab] = useState("flight");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CarbonResults | null>(null);
  const [error, setError] = useState("");

  // Form states
  const [flightData, setFlightData] = useState({
    departure: "",
    destination: "",
    passengers: 1,
    roundTrip: false
  });

  const [vehicleData, setVehicleData] = useState({
    distance: 100,
    distanceUnit: "mi",
    vehicleId: ""
  });

  const [shippingData, setShippingData] = useState({
    weight: 200,
    weightUnit: "g",
    distance: 2000,
    distanceUnit: "km",
    method: "truck"
  });

  const [electricityData, setElectricityData] = useState({
    value: 42,
    unit: "mwh",
    country: "us",
    state: "fl"
  });

  const [fuelData, setFuelData] = useState({
    type: "dfo",
    value: 2,
    unit: "btu"
  });

  const handleSubmit = async (type: "flight" | "vehicle" | "shipping" | "electricity" | "fuel") => {
    setLoading(true);
    setError("");
    
    let dataToSend;
    
    switch(type) {
      case "flight":
        dataToSend = {
          type: "flight",
          passengers: flightData.passengers,
          legs: flightData.roundTrip 
            ? [
                { departure_airport: flightData.departure, destination_airport: flightData.destination },
                { departure_airport: flightData.destination, destination_airport: flightData.departure }
              ] 
            : [
                { departure_airport: flightData.departure, destination_airport: flightData.destination }
              ]
        };
        break;
        
      case "vehicle":
        dataToSend = {
          type: "vehicle",
          distance_unit: vehicleData.distanceUnit,
          distance_value: vehicleData.distance,
          vehicle_model_id: vehicleData.vehicleId
        };
        break;
        
      case "shipping":
        dataToSend = {
          type: "shipping",
          weight_value: shippingData.weight,
          weight_unit: shippingData.weightUnit,
          distance_value: shippingData.distance,
          distance_unit: shippingData.distanceUnit,
          transport_method: shippingData.method
        };
        break;
        
      case "electricity":
        dataToSend = {
          type: "electricity",
          electricity_unit: electricityData.unit,
          electricity_value: electricityData.value,
          country: electricityData.country,
          state: electricityData.state
        };
        break;
        
      case "fuel":
        dataToSend = {
          type: "fuel_combustion",
          fuel_source_type: fuelData.type,
          fuel_source_unit: fuelData.unit,
          fuel_source_value: fuelData.value
        };
        break;
    }
    
    try {
      const response = await fetch('/api/carbon-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to calculate emissions');
      }
      
      setResults(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while calculating emissions');
      } else {
        setError('An error occurred while calculating emissions');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset results when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setResults(null);
    setError("");
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold">Carbon Trace</h1>
          <p className="text-muted-foreground">Track your carbon footprint</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="flight" className="flex flex-col items-center py-2">
              <Plane className="h-4 w-4 mb-1" />
              <span className="text-xs">Flight</span>
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="flex flex-col items-center py-2">
              <Car className="h-4 w-4 mb-1" />
              <span className="text-xs">Vehicle</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex flex-col items-center py-2">
              <Truck className="h-4 w-4 mb-1" />
              <span className="text-xs">Shipping</span>
            </TabsTrigger>
            <TabsTrigger value="electricity" className="flex flex-col items-center py-2">
              <Zap className="h-4 w-4 mb-1" />
              <span className="text-xs">Electric</span>
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex flex-col items-center py-2">
              <Droplet className="h-4 w-4 mb-1" />
              <span className="text-xs">Fuel</span>
            </TabsTrigger>
          </TabsList>

          {error && (
            <Card className="mb-4 border-destructive">
              <CardContent className="p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                <p className="text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          <TabsContent value="flight" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flight Emissions</CardTitle>
                <CardDescription>Calculate CO2 emissions from air travel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Departure Airport</label>
                    <input 
                      type="text" 
                      placeholder="SFO" 
                      className="w-full p-2 border rounded-md bg-background"
                      value={flightData.departure}
                      onChange={(e) => setFlightData({...flightData, departure: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destination Airport</label>
                    <input 
                      type="text" 
                      placeholder="YYZ" 
                      className="w-full p-2 border rounded-md bg-background"
                      value={flightData.destination}
                      onChange={(e) => setFlightData({...flightData, destination: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passengers</label>
                  <input 
                    type="number" 
                    placeholder="1" 
                    min="1"
                    className="w-full p-2 border rounded-md bg-background"
                    value={flightData.passengers}
                    onChange={(e) => setFlightData({...flightData, passengers: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="flex">
                  <label className="flex items-center text-sm font-medium">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={flightData.roundTrip}
                      onChange={(e) => setFlightData({...flightData, roundTrip: e.target.checked})}
                    />
                    Round trip
                  </label>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmit("flight")}
                  disabled={loading || !flightData.departure || !flightData.destination}
                >
                  {loading ? "Calculating..." : "Calculate Emissions"}
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carbon Emissions</span>
                    <span className="text-lg font-bold text-primary">{results.carbon_kg} kg CO₂e</span>
                  </div>
                  <Progress value={75} className="h-2 mb-2" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Distance</span>
                      <div>{results.distance_value} {results.distance_unit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Equivalent to</span>
                      <div>~{Math.round(results.carbon_kg / 2.3)} days of average emissions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="vehicle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Emissions</CardTitle>
                <CardDescription>Calculate CO2 emissions from driving</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Distance</label>
                  <div className="flex space-x-2">
                    <input 
                      type="number" 
                      placeholder="100" 
                      className="flex-1 p-2 border rounded-md bg-background"
                      value={vehicleData.distance}
                      onChange={(e) => setVehicleData({...vehicleData, distance: parseFloat(e.target.value) || 0})}
                    />
                    <select 
                      className="p-2 border rounded-md bg-background"
                      value={vehicleData.distanceUnit}
                      onChange={(e) => setVehicleData({...vehicleData, distanceUnit: e.target.value})}
                    >
                      <option value="mi">Miles</option>
                      <option value="km">Kilometers</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Model ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 7268a9b7-17e8-4c8d-acca-57059252afe9" 
                    className="w-full p-2 border rounded-md bg-background"
                    value={vehicleData.vehicleId}
                    onChange={(e) => setVehicleData({...vehicleData, vehicleId: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find vehicle ID using the Vehicle Makes and Models API endpoints
                  </p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmit("vehicle")}
                  disabled={loading || !vehicleData.distance || !vehicleData.vehicleId}
                >
                  {loading ? "Calculating..." : "Calculate Emissions"}
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carbon Emissions</span>
                    <span className="text-lg font-bold text-primary">{results.carbon_kg} kg CO₂e</span>
                  </div>
                  <Progress value={35} className="h-2 mb-2" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vehicle</span>
                      <div>{results.vehicle_make} {results.vehicle_model}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Distance</span>
                      <div>{results.distance_value} {results.distance_unit}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipping Emissions</CardTitle>
                <CardDescription>Calculate CO2 emissions from shipping</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight</label>
                  <div className="flex space-x-2">
                    <input 
                      type="number" 
                      placeholder="200" 
                      className="flex-1 p-2 border rounded-md bg-background"
                      value={shippingData.weight}
                      onChange={(e) => setShippingData({...shippingData, weight: parseFloat(e.target.value) || 0})}
                    />
                    <select 
                      className="p-2 border rounded-md bg-background"
                      value={shippingData.weightUnit}
                      onChange={(e) => setShippingData({...shippingData, weightUnit: e.target.value})}
                    >
                      <option value="g">Grams</option>
                      <option value="kg">Kilograms</option>
                      <option value="lb">Pounds</option>
                      <option value="mt">Metric Tons</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Distance</label>
                  <div className="flex space-x-2">
                    <input 
                      type="number" 
                      placeholder="2000" 
                      className="flex-1 p-2 border rounded-md bg-background"
                      value={shippingData.distance}
                      onChange={(e) => setShippingData({...shippingData, distance: parseFloat(e.target.value) || 0})}
                    />
                    <select 
                      className="p-2 border rounded-md bg-background"
                      value={shippingData.distanceUnit}
                      onChange={(e) => setShippingData({...shippingData, distanceUnit: e.target.value})}
                    >
                      <option value="km">Kilometers</option>
                      <option value="mi">Miles</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transport Method</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={shippingData.method}
                    onChange={(e) => setShippingData({...shippingData, method: e.target.value})}
                  >
                    <option value="truck">Truck</option>
                    <option value="train">Train</option>
                    <option value="ship">Ship</option>
                    <option value="plane">Plane</option>
                  </select>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmit("shipping")}
                  disabled={loading || !shippingData.weight || !shippingData.distance}
                >
                  {loading ? "Calculating..." : "Calculate Emissions"}
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carbon Emissions</span>
                    <span className="text-lg font-bold text-primary">{results.carbon_kg} kg CO₂e</span>
                  </div>
                  <Progress value={5} className="h-2 mb-2" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weight</span>
                      <div>{results.weight_value} {results.weight_unit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Distance</span>
                      <div>{results.distance_value} {results.distance_unit}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="electricity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Electricity Emissions</CardTitle>
                <CardDescription>Calculate CO2 emissions from electricity usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Electricity Usage</label>
                  <div className="flex space-x-2">
                    <input 
                      type="number" 
                      placeholder="42" 
                      className="flex-1 p-2 border rounded-md bg-background"
                      value={electricityData.value}
                      onChange={(e) => setElectricityData({...electricityData, value: parseFloat(e.target.value) || 0})}
                    />
                    <select 
                      className="p-2 border rounded-md bg-background"
                      value={electricityData.unit}
                      onChange={(e) => setElectricityData({...electricityData, unit: e.target.value})}
                    >
                      <option value="mwh">Megawatt Hours</option>
                      <option value="kwh">Kilowatt Hours</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={electricityData.country}
                    onChange={(e) => setElectricityData({...electricityData, country: e.target.value})}
                  >
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="uk">United Kingdom</option>
                    <option value="au">Australia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State/Province</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={electricityData.state}
                    onChange={(e) => setElectricityData({...electricityData, state: e.target.value})}
                  >
                    <option value="fl">Florida</option>
                    <option value="ca">California</option>
                    <option value="ny">New York</option>
                    <option value="tx">Texas</option>
                  </select>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmit("electricity")}
                  disabled={loading || !electricityData.value}
                >
                  {loading ? "Calculating..." : "Calculate Emissions"}
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carbon Emissions</span>
                    <span className="text-lg font-bold text-primary">{results.carbon_kg} kg CO₂e</span>
                  </div>
                  <Progress value={95} className="h-2 mb-2" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Electricity</span>
                      <div>{results.electricity_value} {results.electricity_unit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location</span>
                      <div>{results.country?.toUpperCase() ?? 'N/A'}, {results.state?.toUpperCase() ?? 'N/A'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="fuel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fuel Combustion</CardTitle>
                <CardDescription>Calculate CO2 emissions from fuel usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Type</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={fuelData.type}
                    onChange={(e) => setFuelData({...fuelData, type: e.target.value})}
                  >
                    <option value="dfo">Diesel Fuel Oil</option>
                    <option value="ng">Natural Gas</option>
                    <option value="pg">Propane Gas</option>
                    <option value="rfo">Residual Fuel Oil</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <div className="flex space-x-2">
                    <input 
                      type="number" 
                      placeholder="2" 
                      className="flex-1 p-2 border rounded-md bg-background"
                      value={fuelData.value}
                      onChange={(e) => setFuelData({...fuelData, value: parseFloat(e.target.value) || 0})}
                    />
                    <select 
                      className="p-2 border rounded-md bg-background"
                      value={fuelData.unit}
                      onChange={(e) => setFuelData({...fuelData, unit: e.target.value})}
                    >
                      <option value="btu">BTU</option>
                      <option value="gallon">Gallon</option>
                      <option value="liter">Liter</option>
                      <option value="kg">Kilogram</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmit("fuel")}
                  disabled={loading || !fuelData.value}
                >
                  {loading ? "Calculating..." : "Calculate Emissions"}
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carbon Emissions</span>
                    <span className="text-lg font-bold text-primary">{results.carbon_kg} kg CO₂e</span>
                  </div>
                  <Progress value={40} className="h-2 mb-2" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fuel</span>
                      <div>{results.fuel_source_value} {results.fuel_source_unit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type</span>
                      <div>{results.fuel_source_type}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
"use client";

import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plane, Car, Truck, Zap, Droplet, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface CarbonResults {
  carbon_g?: number;
  carbon_lb?: number;
  carbon_kg: number;
  carbon_mt?: number;
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

interface VehicleMake {
  data: {
    id: string;
    attributes: {
      name: string;
    }
  }
}

interface VehicleModel {
  data: {
    id: string;
    attributes: {
      name: string;
      year: string | number;
    }
  }
}

export default function TracePage() {
  const [activeTab, setActiveTab] = useState("flight");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CarbonResults | null>(null);
  const [error, setError] = useState("");
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);

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
    vehicleId: "",
    vehicleMakeId: ""
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

  // USA states and Canada provinces data
  const usStates = [
    { value: "al", label: "Alabama" },
    { value: "ak", label: "Alaska" },
    { value: "az", label: "Arizona" },
    { value: "ar", label: "Arkansas" },
    { value: "ca", label: "California" },
    { value: "co", label: "Colorado" },
    { value: "ct", label: "Connecticut" },
    { value: "de", label: "Delaware" },
    { value: "fl", label: "Florida" },
    { value: "ga", label: "Georgia" },
    { value: "hi", label: "Hawaii" },
    { value: "id", label: "Idaho" },
    { value: "il", label: "Illinois" },
    { value: "in", label: "Indiana" },
    { value: "ia", label: "Iowa" },
    { value: "ks", label: "Kansas" },
    { value: "ky", label: "Kentucky" },
    { value: "la", label: "Louisiana" },
    { value: "me", label: "Maine" },
    { value: "md", label: "Maryland" },
    { value: "ma", label: "Massachusetts" },
    { value: "mi", label: "Michigan" },
    { value: "mn", label: "Minnesota" },
    { value: "ms", label: "Mississippi" },
    { value: "mo", label: "Missouri" },
    { value: "mt", label: "Montana" },
    { value: "ne", label: "Nebraska" },
    { value: "nv", label: "Nevada" },
    { value: "nh", label: "New Hampshire" },
    { value: "nj", label: "New Jersey" },
    { value: "nm", label: "New Mexico" },
    { value: "ny", label: "New York" },
    { value: "nc", label: "North Carolina" },
    { value: "nd", label: "North Dakota" },
    { value: "oh", label: "Ohio" },
    { value: "ok", label: "Oklahoma" },
    { value: "or", label: "Oregon" },
    { value: "pa", label: "Pennsylvania" },
    { value: "ri", label: "Rhode Island" },
    { value: "sc", label: "South Carolina" },
    { value: "sd", label: "South Dakota" },
    { value: "tn", label: "Tennessee" },
    { value: "tx", label: "Texas" },
    { value: "ut", label: "Utah" },
    { value: "vt", label: "Vermont" },
    { value: "va", label: "Virginia" },
    { value: "wa", label: "Washington" },
    { value: "wv", label: "West Virginia" },
    { value: "wi", label: "Wisconsin" },
    { value: "wy", label: "Wyoming" },
    { value: "dc", label: "District of Columbia" }
  ];

  const canadaProvinces = [
    { value: "ab", label: "Alberta" },
    { value: "bc", label: "British Columbia" },
    { value: "mb", label: "Manitoba" },
    { value: "nb", label: "New Brunswick" },
    { value: "nl", label: "Newfoundland and Labrador" },
    { value: "ns", label: "Nova Scotia" },
    { value: "nt", label: "Northwest Territories" },
    { value: "nu", label: "Nunavut" },
    { value: "on", label: "Ontario" },
    { value: "pe", label: "Prince Edward Island" },
    { value: "qc", label: "Quebec" },
    { value: "sk", label: "Saskatchewan" },
    { value: "yt", label: "Yukon" }
  ];

  const fuelTypes = [
    { value: "bit", label: "Bituminous Coal" },
    { value: "dfo", label: "Home Heating and Diesel Fuel (Distillate)" },
    { value: "jf", label: "Jet Fuel" },
    { value: "ker", label: "Kerosene" },
    { value: "lig", label: "Lignite Coal" },
    { value: "msw", label: "Municipal Solid Waste" },
    { value: "ng", label: "Natural Gas" },
    { value: "pc", label: "Petroleum Coke" },
    { value: "pg", label: "Propane Gas" },
    { value: "rfo", label: "Residual Fuel Oil" },
    { value: "sub", label: "Subbituminous Coal" },
    { value: "tdf", label: "Tire-Derived Fuel" },
    { value: "wo", label: "Waste Oil" }
  ];

  // Helper function to get units based on fuel type
  const getFuelUnits = (fuelType: string) => {
    switch(fuelType) {
      case 'bit':
      case 'lig':
      case 'msw':
      case 'sub':
      case 'tdf':
        return [
          { value: "short_ton", label: "Short Ton" },
          { value: "btu", label: "BTU" }
        ];
      case 'ng':
        return [
          { value: "thousand_cubic_feet", label: "Thousand Cubic Feet" },
          { value: "btu", label: "BTU" }
        ];
      case 'wo':
        return [
          { value: "barrel", label: "Barrel" },
          { value: "btu", label: "BTU" }
        ];
      default:
        return [
          { value: "gallon", label: "Gallon" },
          { value: "btu", label: "BTU" }
        ];
    }
  };



const [stateOptions, setStateOptions] = useState(usStates);
const [fuelUnitOptions, setFuelUnitOptions] = useState(getFuelUnits('dfo'));

  // Fetch vehicle makes on component mount
  useEffect(() => {
    const fetchVehicleMakes = async () => {
      try {
        const response = await api.getVehicleMakes();
        setVehicleMakes(response.data);
      } catch (err) {
        console.error('Error fetching vehicle makes:', err);
      }
    };

    fetchVehicleMakes();
  }, []);

  // Fetch vehicle models when make is selected
  useEffect(() => {
    if (vehicleData.vehicleMakeId) {
      const fetchVehicleModels = async () => {
        try {
          const response = await api.getVehicleModels(vehicleData.vehicleMakeId);
          setVehicleModels(response.data);
        } catch (err) {
          console.error('Error fetching vehicle models:', err);
        }
      };

      fetchVehicleModels();
    } else {
      setVehicleModels([]);
    }
  }, [vehicleData.vehicleMakeId]);

  useEffect(() => {
    if (electricityData.country === "us") {
      setStateOptions(usStates);
    } else if (electricityData.country === "ca") {
      setStateOptions(canadaProvinces);
    } else {
      setStateOptions([]);
    }
    
    // Reset state selection when country changes
    setElectricityData(prev => ({
      ...prev,
      state: ""
    }));
  }, [electricityData.country]);

  useEffect(() => {
    setFuelUnitOptions(getFuelUnits(fuelData.type));
    
    // Reset unit to first available option when fuel type changes
    if (getFuelUnits(fuelData.type).findIndex(u => u.value === fuelData.unit) === -1) {
      setFuelData(prev => ({
        ...prev,
        unit: getFuelUnits(fuelData.type)[0].value
      }));
    }
  }, [fuelData.type]);

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
      const response = await api.calculateCarbonEstimate(dataToSend);
      setResults(response.data);
    } catch (err: unknown) {
      console.error('Error calculating carbon emissions:', err);
      let errorMessage = 'Failed to calculate emissions';
      
      // Type check before accessing properties
      if (err && typeof err === 'object') {
        const errorObj = err as any;
        errorMessage = errorObj.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
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
                  <label className="text-sm font-medium">Vehicle Make</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={vehicleData.vehicleMakeId}
                    onChange={(e) => setVehicleData({...vehicleData, vehicleMakeId: e.target.value, vehicleId: ""})}
                  >
                    <option value="">Select a make</option>
                    {vehicleMakes.map((make) => (
                      <option key={make.data.id} value={make.data.id}>
                        {make.data.attributes.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Model</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={vehicleData.vehicleId}
                    onChange={(e) => setVehicleData({...vehicleData, vehicleId: e.target.value})}
                    disabled={!vehicleData.vehicleMakeId}
                  >
                    <option value="">Select a model</option>
                    {vehicleModels.map((model) => (
                      <option key={model.data.id} value={model.data.id}>
                        {model.data.attributes.name} ({model.data.attributes.year})
                      </option>
                    ))}
                  </select>
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
                  </select>
                </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State/Province</label>
                    <select 
                      className="w-full p-2 border rounded-md bg-background"
                      value={electricityData.state}
                      onChange={(e) => setElectricityData({...electricityData, state: e.target.value})}
                      disabled={!electricityData.country}
                    >
                      <option value="">Select {electricityData.country === "ca" ? "Province" : "State"}</option>
                      {stateOptions.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
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
                      {fuelTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
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
                        {fuelUnitOptions.map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
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
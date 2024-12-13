const exampleIDFName = 'SimpleHouse';
const exampleIDFExt = '.idf';
const exampleIDFCode = 'Version,9.6;Zone,LIVING ZONE,0,0,0,0,1,1,,;Zone,GARAGE ZONE,0,0,0,0,1,1,,;Zone,ATTIC ZONE,0,0,0,0,1,1,,;BuildingSurface:Detailed,Living:North,Wall,EXTWALL:LIVING,LIVING ZONE,,Outdoors,,,,0.5,4,6.919,6.098,2.4384,6.919,6.098,0,17.242,6.098,0,17.242,6.098,2.4384;BuildingSurface:Detailed,Living:East,Wall,EXTWALL:LIVING,LIVING ZONE,,Outdoors,,,,0.5,4,0,16.876,2.4384,0,16.876,0,0,6.098,0,0,6.098,2.4384;BuildingSurface:Detailed,Living:South,Wall,EXTWALL:LIVING,LIVING ZONE,,Outdoors,,,,0.5,4,17.242,16.876,2.4383,17.242,16.876,0,0,16.876,0,0,16.876,2.4384;BuildingSurface:Detailed,Living:West,Wall,EXTWALL:LIVING,LIVING ZONE,,Outdoors,,,,0.5,4,17.242,6.098,2.4384,17.242,6.098,0,17.242,16.876,0,17.242,16.876,2.4384;BuildingSurface:Detailed,Garage:Interior,WALL,INTERIORWall,GARAGE ZONE,,Surface,Living:Interior,,,0.5,4,6.919,6.098,2.4384,6.919,6.098,0,0,6.098,0,0,6.098,2.4384;BuildingSurface:Detailed,Living:Interior,WALL,INTERIORWall,LIVING ZONE,,Surface,Garage:Interior,,,0.5,4,0,6.098,2.4384,0,6.098,0,6.919,6.098,0,6.919,6.098,2.4384;BuildingSurface:Detailed,Living:Floor,FLOOR,FLOOR:LIVING,LIVING ZONE,,Ground,,,,0,4,17.242,16.876,0,17.242,6.098,0,0,6.098,0,0,16.876,0;BuildingSurface:Detailed,Living:Ceiling,CEILING,CEILING:LIVING,LIVING ZONE,,Surface,Attic:LivingFloor,,,0,4,17.242,6.098,2.4384,17.242,16.876,2.4384,0,16.876,2.4384,0,6.098,2.4384;BuildingSurface:Detailed,Attic:LivingFloor,FLOOR,reverseCEILING:LIVING,ATTIC ZONE,,Surface,Living:Ceiling,,,0.5,4,17.242,16.876,2.4384,17.242,6.098,2.4384,0,6.098,2.4384,0,16.876,2.4384;BuildingSurface:Detailed,NorthRoof1,ROOF,ROOF,ATTIC ZONE,,Outdoors,,,,0.9,4,3.460,11.487,4.6838,3.460,9.5588,3.8804,17.242,9.5588,3.8804,17.242,11.487,4.6838;BuildingSurface:Detailed,SouthRoof,ROOF,ROOF,ATTIC ZONE,,Outdoors,,,,0.5,4,17.242,11.487,4.6838,17.242,16.876,2.4384,0,16.876,2.4384,0,11.487,4.6838;BuildingSurface:Detailed,NorthRoof2,ROOF,ROOF,ATTIC ZONE,,Outdoors,,,,0.9,4,3.460,9.5588,3.8804,6.91,6.098,2.4384,17.242,6.098,2.4384,17.242,9.5588,3.8804;BuildingSurface:Detailed,NorthRoof3,ROOF,ROOF,ATTIC ZONE,,Outdoors,,,,0.9,4,0,11.487,4.6838,0,9.5588,3.8804,3.460,9.5588,3.8804,3.460,11.487,4.6838;BuildingSurface:Detailed,NorthRoof4,ROOF,ROOF,ATTIC ZONE,,Outdoors,,,,0.9,3,0,9.5588,3.8804,0,6.098,2.4384,3.460,9.5588,3.8804;BuildingSurface:Detailed,EastGable,WALL,GABLE,ATTIC ZONE,,Outdoors,,,,0.5,3,0,11.487,4.6838,0,16.876,2.4384,0,6.098,2.4384;BuildingSurface:Detailed,WestGable,WALL,GABLE,ATTIC ZONE,,Outdoors,,,,0.5,3,17.242,11.487,4.6838,17.242,6.098,2.4384,17.242,16.876,2.4384;BuildingSurface:Detailed,EastRoof,ROOF,ROOF,ATTIC ZONE,,Outdoors,,,,0.9,4,3.460,0,3.8804,3.460,9.5588,3.8804,0,6.098,2.4384,0,0,2.4384;BuildingSurface:Detailed,WestRoof,ROOF,ROOF,ATTIC ZONE,,Outdoors,,,,0.9,4,6.919,0,2.4384,6.919,6.098,2.4384,3.460,9.5588,3.8804,3.460,0,3.8804;BuildingSurface:Detailed,Attic:NorthGable,WALL,GABLE,ATTIC ZONE,,Outdoors,,,,0.5,3,3.460,0,3.8804,0,0,2.4384,6.919,0,2.4384;BuildingSurface:Detailed,Garage:EastWall,WALL,EXTWALL:GARAGE,GARAGE ZONE,,Outdoors,,,,0.5,4,0,6.098,2.4384,0,6.098,0,0,0,0,0,0,2.4384;BuildingSurface:Detailed,Garage:WestWall,WALL,EXTWALL:GARAGE,GARAGE ZONE,,Outdoors,,,,0.5,4,6.919,0,2.4384,6.919,0,0,6.919,6.098,0,6.919,6.098,2.4384;BuildingSurface:Detailed,Garage:FrontDoor,WALL,Garage:SteelDoor,GARAGE ZONE,,Outdoors,,,,0.5,4,0,0,2.4384,0,0,0,6.919,0,0,6.919,0,2.4384;BuildingSurface:Detailed,Attic:GarageFloor,FLOOR,CEILING:Garage,ATTIC ZONE,,Surface,Garage:Ceiling,,,0.5,4,6.919,6.098,2.4384,6.919,0,2.4384,0,0,2.4384,0,6.098,2.4384;BuildingSurface:Detailed,Garage:Ceiling,CEILING,CEILING:Garage,GARAGE ZONE,,Surface,Attic:GarageFloor,,,0.5,4,6.919,0,2.4384,6.919,6.098,2.4384,0,6.098,2.4384,0,0,2.4384;BuildingSurface:Detailed,Garage:Floor,FLOOR,FLOOR:GARAGE,GARAGE ZONE,,Ground,,,,0,4,6.919,6.098,0,6.919,0,0,0,0,0,0,6.098,0;FenestrationSurface:Detailed,NorthWindow,Window,Dbl Clr 3mm/6mm Air,Living:North,,0.5,,1,4,10.67,6.098,2.1336,10.67,6.098,0.6096,15.242,6.098,0.6096,15.242,6.098,2.1336;FenestrationSurface:Detailed,EastWindow,Window,Dbl Clr 3mm/6mm Air,Living:East,,0.5,,1,4,0,14.876,2.1336,0,14.876,0.6096,0,10.304,0.6096,0,10.304,2.1336;FenestrationSurface:Detailed,SouthWindow,Window,Dbl Clr 3mm/6mm Air,Living:South,,0.5,,1,4,15.242,16.876,2.1336,15.242,16.876,0.6096,10.67,16.876,0.6096,10.67,16.876,2.1336;FenestrationSurface:Detailed,WestWindow,Window,Dbl Clr 3mm/6mm Air,Living:West,,0.5,,1,4,17.242,10.304,2.1336,17.242,10.304,0.6096,17.242,14.876,0.6096,17.242,14.876,2.1336;';
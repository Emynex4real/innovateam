require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED PHYSICS SYLLABUS CONTENT
// Sourced verbatim from JAMB Physics Syllabus
const PHYSICS_SYLLABUS = {
  subject: 'Physics',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Physics is to prepare the candidates for the Board’s examination. It is designed to test their achievement of the course objectives, which are to:
(1) sustain their interest in physics;
(2) develop attitude relevant to physics that encourage accuracy, precision and objectivity;
(3) interpret physical phenomena, laws, definitions, concepts and other theories;
(4) demonstrate the ability to solve correctly physics problems using relevant theories and concepts.`
    },
    {
      name: 'Measurements and Units',
      content: `TOPICS/CONTENTS/NOTES:
(a) Length, area and volume: Metre rule, Venier calipers, Micrometer Screw-guage, measuring cylinder. 
(b) Mass
(i) unit of mass;
(ii) use of simple beam balance;
(iii) concept of beam balance.
(c) Time
(i) unit of time;
(ii) time-measuring devices.
(d) Fundamental physical quantities
(e) Derived physical quantities and their units
(i) Combinations of fundamental quantities and determination of their units;
(f) Dimensions
(i) definition of dimensions
(ii) simple examples
(g) Limitations of experimental measurements
(i) accuracy of measuring instruments;
(ii) simple estimation of errors;
(iii) significant figures;
(iv) standard form.
(h) Measurement, position, distance and displacement
(i) concept of displacement;
(ii) distinction between distance and displacement;
(iii) concept of position and coordinates;
(iv) frame of reference.

OBJECTIVES:
Candidates should be able to:
i. identify the units of length, area and volume;
ii. use different measuring instruments;
iii. determine the lengths, surface areas and volume of regular and irregular bodies;
iv. identify the unit of mass;
v. use simple beam balance, e.g Buchart’s balance and chemical balance;
vi. identify the unit of time;
vii. use different time-measuring devices;
viii. relate the fundamental physical quantities to their units;
ix. deduce the units of derived physical quantities;
x. determine the dimensions of physical quantities;
xi. use the dimensions to determine the units of physical quantities;
xii. test the homogeneity of an equation;
xiii. determine the accuracy of measuring instruments;
xiv. estimate simple errors;
xv. express measurements in standard form;
xvi. use strings, meter ruler and engineering calipers, vernier calipers and micrometer, screw guage;
xvii. note the degree of accuracy;
xviii. identify distance travel in a specified direction;
xix. use compass and protractor to locate points/directions;
xx. use Cartesians systems to locate positions in x-y plane;
xxi. plot graph and draw inference from the graph.`
    },
    {
      name: 'Scalars and Vectors',
      content: `TOPICS/CONTENTS/NOTES:
(i) definition of scalar and vector quantities;
(ii) examples of scalar and vector quantities;
(iii) relative velocity;
(iv) resolution of vectors into two perpendicular directions including graphical methods of solution. 

OBJECTIVES:
Candidates should be able to:
i. distinguish between scalar and vector quantities;
ii. give examples of scalar and vector quantities;
iii. determine the resultant of two or more vectors;
iv. determine relative velocity;
v. resolve vectors into two perpendicular components;
vi. use graphical methods to solve vector problems.`
    },
    {
      name: 'Motion',
      content: `TOPICS/CONTENTS/NOTES:
(a) Types of motion: translational, oscillatory, rotational, spin and random
(b) Relative motion
(c) Causes of motion
(d) Types of force
(i) contact
(ii) force field
(e) linear motion
(i) speed, velocity and acceleration;
(ii) equations of uniformly accelerated motion;
(iii) motion under gravity;
(iv) distance-time graph and velocity time graph; 

[Image of velocity-time graph]

(v) instantaneous velocity and acceleration.
(f) Projectiles:
(i) calculation of range, maximum height and time of flight from the ground and a height; 

[Image of projectile motion trajectory]

(ii) applications of projectile motion.
(g) Newton’s laws of motion:
(i) inertia, mass and force;
(ii) relationship between mass and acceleration;
(iii) impulse and momentum;
(iv) force – time graph;
(v) conservation of linear momentum (Coefficient of restitution not necessary).
(h) Motion in a circle:
(i) angular velocity and angular acceleration;
(ii) centripetal and centrifugal forces;
(iii) applications.
(i) Simple Harmonic Motion (S.H.M):
(i) definition and explanation of simple harmonic motion;
(ii) examples of systems that execute S.H.M;
(iii) period, frequency and amplitude of S.H.M;
(iv) velocity and acceleration of S.H.M;
(iii) simple treatment of energy change in S.H.M;
(iv) force vibration and resonance (simple treatment).

OBJECTIVES:
Candidates should be able to;
i. identify different types of motion;
ii. solve numerical problem on collinear motion;
iii. identify force as cause of motion;
iv. identify push and pull as forms of force;
v. identify electric and magnetic attractions, gravitational pull as forms of field forces;
vi. differentiate between speed, velocity and acceleration;
vii. deduce equations of uniformly accelerated motion;
viii. solve problems of motion under gravity;
ix. interpret distance-time graph and velocity-time graph;
x. compute instantaneous velocity and acceleration;
xi. establish expressions for the range, maximum height and time of flight of projectiles, rockets, missiles;
xii. solve problems involving projectile motion;
xiii. solve numerical problems involving impulse and momentum;
xiv. interpretation of area under force – time graph;
xv. interpret Newton’s laws of motion;
xvi. compare inertia, mass and force;
xvii. deduce the relationship between mass and acceleration;
xviii. interpret the law of conservation of linear momentum and application;
xix. establish expression for angular velocity, angular acceleration and centripetal force;
xx. solve numerical problems involving motion in a circle;
xxi. establish the relationship between period and frequency;
xxii. analyse the energy changes occurring during S.H.M;
xxiii. identify different types of forced vibration;
xxiv. enumerate applications of resonance.`
    },
    {
      name: 'Gravitational field',
      content: `TOPICS/CONTENTS/NOTES:
(i) Newton’s law of universal gravitation;
(ii) gravitational potential;
(iii) conservative and non-conservative fields;
(iv) acceleration due to gravity;
(v) variation of g on the earth’s surface;
(vi) distinction between mass and weight escape velocity;
(vii) parking orbit and weightlessness.

OBJECTIVES:
Candidates should be able to:
i. identify the expression for gravitational force between two bodies;
ii. apply Newton’s law of universal gravitation;
iii. give examples of conservative and non-conservative fields;
iv. deduce the expression for gravitational field potentials;
v. identify the causes of variation of g on the earth’s surface;
vi. differentiate between mass and weight;
vii. determine escape velocity.`
    },
    {
      name: 'Equilibrium of Forces',
      content: `TOPICS/CONTENTS/NOTES:
(a) equilibrium of particles:
(i) equilibrium of coplanar forces;
(ii) triangles and polygon of forces; 

[Image of triangle of forces diagram]

(iii) Lami’s theorem.
(b) principles of moments
(i) moment of a force;
(ii) simple treatment and moment of a couple (torque);
(iii) applications.
(c) conditions for equilibrium of rigid bodies under the action of parallel and non-parallel forces
(i) resolution and composition of forces in two perpendicular directions;
(ii) resultant and equilibrant.
(d) centre of gravity and stability
(i) stable, unstable and neutral equilibra.

OBJECTIVES:
Candidates should be able to:
i. apply the conditions for the equilibrium of coplanar forces to solve problems;
ii. use triangle and polygon laws of forces to solve equilibrium problems;
iii. use Lami’s theorem to solve problems;
iv. analyse the principle of moment of a force;
v. determine moment of a force and couple;
vi. describe some applications of moment of a force and couple;
vii. apply the conditions for the equilibrium of rigid bodies to solve problems;
viii. resolve forces into two perpendicular directions;
ix. determine the resultant and equilibrant of forces;
x. differentiate between stable, unstable and neutral equilibra.`
    },
    {
      name: 'Work, Energy and Power',
      content: `TOPICS/CONTENTS/NOTES:
(a) Work, Energy and Power
(i) definition of work, energy and power;
(ii) forms of energy;
(iii) conservation of energy;
(iv) qualitative treatment between different forms of energy;
(v) interpretation of area under the force-distance curve.
(b) Energy and society
(i) sources of energy;
(ii) renewable and non-renewable energy e.g. coal, crude oil, sun, wind etc.;
(iii) uses of energy;
(iv) energy and development;
(v) energy diversification;
(vi) environmental impact of energy e.g. global warming, greenhouse effect and spillage;
(vii) energy crises;
(viii) conversion of energy;
(ix) devices used in energy production.
(c) Dams and energy production 
(i) location of dams
(ii) energy production
(d) nuclear energy
(e) solar energy
(i) solar collector;
(ii) solar panel for energy supply.

OBJECTIVES:
Candidates should be able to:
i. differentiate between work, energy and power;
ii. compare different forms of energy, giving examples;
iii. apply the principle of conservation of energy;
iv. examine the transformation between different forms of energy;
v. interpret the area under the force – distance curve;
vi. solve numerical problems in work, energy and power;
vii. itemize the sources of energy;
viii. distinguish between renewable and non-renewable energy, examples should be given;
ix. identify methods of energy transition;
x. explain the importance of energy in the development of the society;
xi. analyze the effect of energy use to the environment;
xii. identify the impact of energy on the environment;
xiii. identify energy sources that are friendly or hazardous to the environment;
xiv. identify energy uses in their immediate environment;
xv. suggests ways of safe energy use;
xvi. state different forms of energy conversion.`
    },
    {
      name: 'Friction',
      content: `TOPICS/CONTENTS/NOTES:
(i) static and dynamic friction;
(ii) coefficient of limiting friction and its determination;
(iii) advantages and disadvantages of friction
(iv) reduction of friction;
(v) qualitative treatment of viscosity and terminal velocity;
(vi) Stoke’s law.

OBJECTIVES:
Candidates should be able to:
i. differentiate between static and dynamic friction;
ii. determine the coefficient of limiting friction;
iii. compare the advantages and disadvantages of friction;
iv. suggest ways by which friction can be reduced;
v. analyse factors that affect viscosity and terminal velocity;
vi. apply Stoke’s law.`
    },
    {
      name: 'Simple Machines',
      content: `TOPICS/CONTENTS/NOTES:
(i) definition of simple machines;
(ii) types of machines; 

[Image of pulley system diagram]

(iii) mechanical advantage, velocity ratio and efficiency of machines.

OBJECTIVES:
Candidates should be able to:
i. identify different types of simple machines;
ii. solve problems involving simple machines.`
    },
    {
      name: 'Elasticity: Hooke’s Law and Young’s Modulus',
      content: `TOPICS/CONTENTS/NOTES:
(i) elastic limit, yield point, breaking point, Hooke’s law and Young’s modulus;
(ii) the spring balance as a device for measuring force;
(iii.) work done per unit volume in springs and elastic strings;

OBJECTIVES:
Candidates should be able to:
i. interpret force-extension curves;
ii. interpret Hooke’s law and Young’s modulus of a material;
iii use spring balance to measure force;
iv. determine the work done in spring and elastic strings.`
    },
    {
      name: 'Pressure',
      content: `TOPICS/CONTENTS/NOTES:
(a) Atmospheric Pressure
(i) definition of atmospheric pressure;
(ii) units of pressure (S.I) units (Pa);
(iii) measurement of pressure;
(iv) simple mercury barometer; aneroid barometer and manometer; 

[Image of simple mercury barometer]

(v) variation of pressure with height;
(vi) the use of barometer as an altimeter.
(b) Pressure in liquids
(i) the relationship between pressure, depth and density (P = pgh)
(ii) transmission of pressure in liquids (Pascal’s Principle)
(iii) application

OBJECTIVES:
Candidates should be able to:
i. recognize the S.I units of pressure (Pa);
ii. identify pressure measuring instruments;
iii. relate the variation of pressure to height;
iv. use a barometer as an altimeter;
v. determine the relationship between pressure depth and density;
vi apply the principle of transmission of pressure in liquids to solve problems;
vii. determine and apply the principle of pressure in liquid.`
    },
    {
      name: 'Liquids At Rest',
      content: `TOPICS/CONTENTS/NOTES:
(i) determination of density of solids and liquids
(ii) definition of relative density
(iii) upthrust on a body immersed in a liquid
(iv) Archimedes’ principle and law of floatation and applications, e.g. ships and hydrometers. 

[Image of Archimedes principle experiment]


OBJECTIVES:
Candidates should be able to:
i. distinguish between density and relative density of substances;
ii. determine the upthrust on a body immersed in a liquid;
iii. apply Archimedes’ principle and law of floatation to solve problems.`
    },
    {
      name: 'Temperature and Its Measurement',
      content: `TOPICS/CONTENTS/NOTES:
(i) concept of temperature
(ii) thermometric properties
(iii) calibration of thermometers
(iv) temperature scales –Celsius and Kelvin.
(v) types of thermometers
(vi) conversion from one scale of temperature to another

OBJECTIVES:
Candidates should be able to:
i. identify thermometric properties of materials that are used for different thermometers;
ii. calibrate thermometers;
iii. differentiate between temperature scales e.g. Celsius, Fahrenheit and Kelvin;
iv. compare the types of thermometers;
vi. convert from one scale of temperature to another.`
    },
    {
      name: 'Thermal Expansion',
      content: `TOPICS/CONTENTS/NOTES:
(a) Solids
(i) definition and determination of linear, volume and area expansivities;
(ii) effects and applications, e.g. expansion in building strips and railway lines;
(iii) relationship between different expansivities.
(b) Liquids
(i) volume expansivity;
(ii) real and apparent expansivities;
(iii) determination of volume expansivity;
(iv) anomalous expansion of water.

OBJECTIVES:
Candidates should be able to:
i. determine linear and volume expansivities;
ii. assess the effects and applications of thermal expansivities;
iii. determine the relationship between different expansivities;
iv. determine volume, apparent, and real expansivities of liquids;
v. analyse the anomalous expansion of water.`
    },
    {
      name: 'Gas Laws',
      content: `TOPICS/CONTENTS/NOTES:
(i) Boyle’s law (isothermal process)
(ii) Charle’s law (isobaric process)
(iii) Pressure law (volumetric process) 

[Image of Boyle's and Charles' law graphs]

(iv) absolute zero of temperature
(v) general gas equation: (PV/T = constant)
(vi) ideal gas equation Pv = nRT
(iv) Van der waal gas

OBJECTIVES:
Candidates should be able to:
i. interpret the gas laws;
ii. use expression of these laws to solve numerical problems;
iii. interpret Van der waal equation for one mole of a real gas.`
    },
    {
      name: 'Quantity of Heat',
      content: `TOPICS/CONTENTS/NOTES:
(i) heat as a form of energy;
(ii) definition of heat capacity and specific heat capacity of solids and liquids;
(iii) determination of heat capacity and specific heat capacity of substances by simple methods e.g. method of mixtures and electrical method and Newton’s law of cooling

OBJECTIVES:
Candidates should be able to:
i. differentiate between heat capacity and specific heat capacity;
ii. determine heat capacity and specific heat capacity using simple methods;
iii. solve numerical problems.`
    },
    {
      name: 'Change of State',
      content: `TOPICS/CONTENTS/NOTES:
(i) latent heat;
(ii) specific latent heats of fusion and vaporization;
(iii) melting, evaporation and boiling;
(iv) the influence of pressure and of dissolved substances on boiling and melting points;
(v) application in appliances. 

[Image of heating curve of water]


OBJECTIVES:
Candidates should be able to:
i. differentiate between latent heat and specific latent heats of fusion and vaporization;
ii. differentiate between melting, evaporation and boiling;
iii. examine the effects of pressure and of dissolved substance on boiling and melting points.
iv. solve numerical problems.`
    },
    {
      name: 'Vapours',
      content: `TOPICS/CONTENTS/NOTES:
(i) unsaturated and saturated vapours;
(ii) relationship between saturated vapour pressure (S.V.P) and boiling;
(iii) determination of S.V.P by barometer tube method;
(iv) formation of dew, mist, fog, clouds and rain;
(v) study of dew point, humidity and relative humidity;
(vi) hygrometry; estimation of the humidity of the atmosphere using wet and dry bulb hygrometers.

OBJECTIVES:
Candidates should be able to:
i. distinguish between saturated and unsaturated vapours;
ii. relate saturated vapour pressure to boiling point;
iii. determine S.V.P by barometer tube method;
iv. differentiate between dew point, humidity and relative humidity;
vi. estimate the humidity of the atmosphere using wet and dry bulb hygrometers;
vii. solve numerical problems.`
    },
    {
      name: 'Structure of Matter and Kinetic Theory',
      content: `TOPICS/CONTENTS/NOTES:
(a) Molecular nature of matter
(i) atoms and molecules;
(ii) molecular theory: explanation of Brownian motion, diffusion, surface tension, capillarity, adhesion, cohesion and angles of contact law of definite proportion;
(iii) examples and applications.
(b) Kinetic Theory
(i) assumptions of the kinetic theory
(ii) using the theory to explain the pressure exerted by gas, Boyle’s law, Charles’ law, melting, boiling, vapourization, change in temperature, evaporation, etc.

OBJECTIVES:
Candidates should be able to:
i. differentiate between atoms and molecules;
ii. use molecular theory to explain Brownian motion, diffusion, surface, tension, capillarity, adhesion, cohesion and angle of contact;
iii. examine the assumptions of kinetic theory;
iv. interpret kinetic theory, the pressure exerted by gases, Boyle’s law, Charles’s law, melting, boiling, vaporization, change in temperature, evaporation, etc.`
    },
    {
      name: 'Heat Transfer',
      content: `TOPICS/CONTENTS/NOTES:
(i) conduction, convection and radiation as modes of heat transfer;
(ii) temperature gradient, thermal conductivity and heat flux;
(iii) effect of the nature of the surface on the energy radiated and absorbed by it;
(iv) the conductivities of common materials;
(v) the thermos flask and vacuum flask;
(vi) land and sea breeze;
(vii) combustion engine.

OBJECTIVES:
Candidates should be able to:
i. differentiate between conduction, convection and radiation as modes of heat transfer;
ii. solve problems on temperature gradient, thermal conductivity and heat flux;
iii. assess the effect of the nature of the surface on the energy radiated and absorbed by it;
iv. compare the conductivities of common materials;
v. relate the component part of the working of the thermos flask;
vi. differentiate between land and sea breeze;
vii. analyse the principles of operating internal combustion jet engines, rockets.`
    },
    {
      name: 'Waves',
      content: `TOPICS/CONTENTS/NOTES:
(a) Production and Propagation
(i) wave motion;
(ii) vibrating systems as source of waves;
(iii) waves as mode of energy transfer;
(iv) distinction between particle motion and wave motion;
(v) relationship between frequency, wavelength and wave velocity (V=f λ);
(vi) phase difference, wave number and wave vector;
(vii) progressive wave equation e.g. Y = A sin (vt + 0)
(b) Classification
(i) types of waves; mechanical and electromagnetic waves;
(ii) longitudinal and transverse waves; 

[Image of transverse vs longitudinal waves]

(iii) stationary and progressive waves;
(iv) examples of waves from springs, ropes, stretched strings and the ripple tank.
(c) Characteristics/Properties
(i) reflection, refraction, diffraction and plane polarization;
(ii) superposition of waves e.g. interference
(iii) Beats;
(iv) Doppler effects (qualitative treatment only).

OBJECTIVES:
Candidates should be able to:
i. interpret wave motion;
ii. identify vibrating systems as sources of waves;
iii use waves as a mode of energy transfer;
iv distinguish between particle motion and wave motion;
v. relate frequency and wave length to wave velocity;
vi. determine phase difference, wave number and wave vector;
vii. use the progressive wave equation to compute basic wave parameters;
viii. differentiate between mechanical and electromagnetic waves;
ix. differentiate between longitudinal and transverse waves;
x. distinguish between stationary and progressive waves;
xi. indicate the example of waves generated from springs, ropes, stretched strings and the ripple tank;
xii. differentiate between reflection, refraction, diffraction and plane polarization of waves;
xiii. analyse the principle of superposition of waves;
xiv. solve numerical problems on waves explain the phenomenon of beat, beat frequency and uses;
xv. explain Doppler effect of sound and application`
    },
    {
      name: 'Propagation of Sound Waves',
      content: `TOPICS/CONTENTS/NOTES:
(i) the necessity for a material medium;
(ii) speed of sound in solids, liquids and air;
(iii) reflection of sound; echoes, reverberation and their applications;
(v) advantages and disadvantages of echoes and reverberations.

OBJECTIVES:
Candidates should be able to:
i. determine the need for a material medium in the propagation of sound waves;
ii. compare the speed of sound in solids, liquids and air;
iii. relate the effects of temperature and pressure to the speed of sound in air;
iv. solve problem on echoes, reverberation and speed;
v. compare the disadvantages and advantages of echoes.
vi. solve problems on echo, reverberation and speed of sound.`
    },
    {
      name: 'Characteristics of Sound Waves',
      content: `TOPICS/CONTENTS/NOTES:
(i) noise and musical notes;
(ii) quality, pitch, intensity and loudness and their application to musical instruments;
(iii) simple treatment of harmonics and overtones produced by vibrating strings and their columns;
(iv) acoustic examples of resonance;
(v) frequency of a note emitted by air columns in closed and open pipes in relation to their lengths.

OBJECTIVES:
Candidates should be able to:
i. differentiate between noise and musical notes;
ii. analyse quality, pitch, intensity and loudness of sound notes;
iii. evaluate the application of (ii) above in the construction of musical instruments;
iv. identify overtones by vibrating stings and air columns;
iv. itemize acoustical examples of resonance;
vi. determine the frequencies of notes emitted by air columns in open and closed pipes in relation to their lengths.`
    },
    {
      name: 'Light Energy',
      content: `TOPICS/CONTENTS/NOTES:
(a) Sources of Light
(i) natural and artificial sources of light;
(ii) luminous and non-luminous objects.
(b) Propagation of light
(i) speed, frequency and wavelength of light;
(ii) formation of shadows and eclipse;
(iii) the pin-hole camera.

OBJECTIVES:
Candidates should be able to:
i. compare the natural and artificial sources of light;
ii. differentiate between luminous and non luminous objects;
iii. relate the speed, frequency and wavelength of light;
iv. interpret the formation of shadows and eclipses;
v. solve problems using the principle of operation of a pin-hole camera.`
    },
    {
      name: 'Reflection of Light at Plane and Curved Surfaces',
      content: `TOPICS/CONTENTS/NOTES:
(i) laws of reflection;
(ii) application of reflection of light;
(iii) formation of images by plane, concave and convex mirrors and ray diagrams; 

[Image of concave mirror ray diagram]

(iv) use of the mirror formula: 1/f = 1/u + 1/v
(v) linear and angular magnification.

OBJECTIVES:
Candidates should be able to:
i. interpret the laws of reflection;
ii. illustrate the formation of images by plane, concave and convex mirrors;
iii. apply the mirror formula to solve optical problems;
iv. determine the linear magnification;
v. apply the laws of reflection of light to the working of periscope, kaleidoscope and the sextant.`
    },
    {
      name: 'Refraction of Light Through at Plane and Curved Surfaces',
      content: `TOPICS/CONTENTS/NOTES:
(i) explanation of refraction in terms of velocity of light in the media;
(ii) laws of refraction;
(iii) definition of refractive index of a medium;
(iv) determination of refractive index of glass and liquid using Snell’s law;
(v) real and apparent depth and lateral displacement;
(vi) critical angle and total internal reflection.
(b) Glass Prism
(i) use of the minimum deviation formula: U = sin[(A+D)/2] / sin[A/2] 

[Image of refraction through glass prism]

(ii) type of lenses: triangular, rectangular etc
(iii) use of lens formula: 1/f = 1/u + 1/v and Newton’s formular (F2 = ab)
(iv) magnification.

OBJECTIVES:
Candidates should be able to:
i. interpret the laws of reflection;
ii. determine the refractive index of glass and liquid using Snell’s law;
iii. determine the refractive index using the principle of real and apparent depth;
iv. determine the conditions necessary for total internal reflection;
v. examine the use of periscope, prism, binoculars, optical fibre;
vi. apply the principles of total internal reflection to the formation of mirage;
vii. use of lens formula and ray diagrams to solve optical numerical problems;
viii. determine the magnification of an image;
ix. calculate the refractive index of a glass prism using minimum deviation formula.`
    },
    {
      name: 'Optical Instruments',
      content: `TOPICS/CONTENTS/NOTES:
(i) general principles of microscopes, telescopes, projectors, cameras and the human eye (physiological details of the eye are not required); 

[Image of compound microscope ray diagram]

(ii) power of a lens;
(iii) angular magnification;
(iv) near and far points;
(v) sight defects and their corrections.

OBJECTIVES:
Candidates should be able to:
i. apply the principles of operation of optical instruments to solve problems;
ii. distinguish between the human eye and the cameras;
iii. calculate the power of a lens;
iv. evaluate the angular magnification of optical instruments;
v. determine the near and far points;
vi. detect sight defects and their corrections.`
    },
    {
      name: 'Dispersion of light and colours',
      content: `TOPICS/CONTENTS/NOTES:
(a) Dispersion of light and colours
(i) dispersion of white light by a triangular Prism; 

[Image of dispersion of white light through prism]

(ii) production of pure spectrum;
(iii) colour mixing by addition and subtraction;
(iv) colour of objects and colour filters;
(v) rainbow and formation.
(b) Electromagnetic spectrum
(i) description of sources and uses of various types of radiation.

OBJECTIVES:
Candidates should be able to:
i. identify primary colours and obtain secondary colours by mixing;
ii. understand the formation of rainbow;
iii. deduce why objects have colours;
iv. relate the expression for gravitational force between two bodies;
v. apply Newton’s law of universal gravitation;
vi. analyse colours using colour filters;
vii. analyse the electromagnetic spectrum in relation to their wavelengths, sources, detection and uses.`
    },
    {
      name: 'Electrostatics',
      content: `TOPICS/CONTENTS/NOTES:
(i) existence of positive and negative charges in matter;
(ii) charging a body by friction, contact and induction;
(iii) electroscope; 

[Image of gold leaf electroscope]

(iv) Coulomb’s inverse square law, electric field and potential;
(v) electric field intensity potential and potential difference;
(vi) electric discharge and lightning.

OBJECTIVES:
Candidates should be able to:
i. identify charges;
ii. examine uses of an electroscope;
iii. apply Coulomb’s square law of electrostatics to solve problems;
iv. deduce expressions for electric field intensity and potential difference;
v. identify electric field flux patterns of isolated and interacting charges;
vi. analyse the distribution of charges on a conductor and how it is used in lightening conductors.`
    },
    {
      name: 'Capacitors',
      content: `TOPICS/CONTENTS/NOTES:
(i) types and functions of capacitors;
(ii) parallel plate capacitors; 
(iii) capacitance of a capacitor;
(iv) the relationship between capacitance, area separation of plates and medium between the plates C = EA/d
(v) capacitors in series and parallel;
(vi) energy stored in a capacitor.

OBJECTIVES:
Candidates should be able to:
i. determine uses of capacitors;
ii. analyse parallel plate capacitors;
iii. determine the capacitance of a capacitor;
iv. analyse the factors that affect the capacitance of a capacitor;
v. solve problems involving the arrangement of a capacitor;
vi. determine the energy stored in capacitors.`
    },
    {
      name: 'Electric Cells',
      content: `TOPICS/CONTENTS/NOTES:
(i) simple voltaic cell and its defects;
(ii) Daniel cell, Leclanche cell (wet and dry);
(iii) lead –acid accumulator and Nickel-Iron (Nife) Lithium lon and Mercury cadmium;
(iv) maintenance of cells and batteries (detail treatment of the chemistry of a cell is not required);
(vi) arrangement of cells;
(vii) efficiency of a cell.

OBJECTIVES:
Candidates should be able to:
i. identify the defects of the simple voltaic cell and their correction;
ii. compare different types of cells including solar cell;
iii. compare the advantages of lead-acid and Nikel iron accumulator;
iv. solve problems involving series and parallel combination of cells.`
    },
    {
      name: 'Current Electricity',
      content: `TOPICS/CONTENTS/NOTES:
(i) electromagnetic force (emf), potential difference (p.d.), current, internal resistance of a cell and lost Volt;
(ii) Ohm’s law, resistivity and conductivity;
(iii) measurement of resistance;
(iv) meter bridge;
(v) resistance in series and in parallel and their combination;
(vi) the potentiometer method of measuring emf, current and internal resistance of a cell.
(i) electrical networks.

OBJECTIVES:
Candidates should be able to:
i. differentiate between emf, p.d., current and internal resistant of a cell;
ii. apply Ohm’s law to solve problems;
iii. use metre bridge to calculate resistance;
iv. compute effective total resistance of both parallel and series arrangement of resistors;
v. determine the resistivity and the conductivity of a conductor;
vi. measure emf. current and internal resistance of a cell using the potentiometer;
vii. identify the advantages of the potentiometer;
viii. apply Kirchoff’s law in electrical networks.`
    },
    {
      name: 'Electrical Energy and Power',
      content: `TOPICS/CONTENTS/NOTES:
(i) concepts of electrical energy and power;
(ii) commercial unit of electric energy and power;
(iii) electric power transmission
(v) heating effects of electric current;
(vi) electrical wiring of houses;
(vii) use of fuses.

OBJECTIVES:
Candidates should be able to:
i. apply the expressions of electrical energy and power to solve problems;
ii. analyse how power is transmitted from the power station to the consumer;
iii. identify the heating effects of current and its uses;
iv. identify the advantages of parallel arrangement over series;
v. determine the fuse rating.`
    },
    {
      name: 'Magnets and Magnetic Fields',
      content: `TOPICS/CONTENTS/NOTES:
(i) natural and artificial magnets;
(ii) magnetic properties of soft iron and steel;
(iii) methods of making magnets and demagnetization;
(iv) concept of magnetic field; 

[Image of magnetic field lines around bar magnet]

(v) magnetic field of a permanent magnet;
(vi) magnetic field round a straight current carrying conductor, circular wire and solenoid;
(vii) properties of the earth’s magnetic field; north and south poles, magnetic meridian and angle of dip and declination;
(viii) flux and flux density;
(ix) variation of magnetic field intensity over the earth’s surface
(x) applications: earth’s magnetic field in navigation and mineral exploration.

OBJECTIVES:
Candidates should be able to:
i. give examples of natural and artificial magnets;
ii. differentiate between the magnetic properties of soft iron and steel;
iii. identify the various methods of making magnets and demagnetizing magnets;
iv. describe how to keep a magnet from losing its magnetism;
v. determine the flux pattern exhibited when two magnets are placed together pole to pole;
vi. determine the flux of a current carrying conductor, circular wire and solenoid including the polarity of the solenoid;
vii. determine the flux pattern of a magnet placed in the earth’s magnetic fields;
viii. identify the magnetic elements of the earth’s flux;
ix. determine the variation of earth’s magnetic field on the earth’s surface;
x. examine the applications of the earth’s magnetic field.`
    },
    {
      name: 'Force on a Current-Carrying Conductor in a Magnetic Field',
      content: `TOPICS/CONTENTS/NOTES:
(i) quantitative treatment of force between two parallel current-carrying conductors;
(ii) force on a charge moving in a magnetic field;
(iii) the d. c. motor; 

[Image of DC motor working principle]

(iv) electromagnets;
(v) carbon microphone;
(vi) moving coil and moving iron instruments;
(viii) conversion of galvanometers to ammeters and voltmeter using shunts and multipliers;
(ix) sensitivity of a galvanometer.

OBJECTIVES:
Candidates should be able to:
i. determine the direction of force on a current carrying conductor using Fleming’s left-hand rule;
ii. interpret the attractive and repulsive forces between two parallel current-carrying conductors using diagrams;
iii. determine the relationship between the force, magnetic field strength, velocity and the angle through which the charge enters the field;
iv. interpret the working of the d. c. motor;
v. analyse the principle of electromagnets and give examples of its application;
vi. compare moving iron and moving coil instruments;
vii. convert a galvanometer into an ammeter or a voltmeter;
viii. identify the factors affecting the sensitivity of a galvanometer.`
    },
    {
      name: 'Electromagnetic Induction',
      content: `TOPICS/CONTENTS/NOTES:
(a) Electromagnetic Induction
(i) Faraday’s laws of electromagnetic induction;
(ii) factors affecting induced emf;
(iii) Lenz’s law as an illustration of the principle of conservation of energy;
(iv) a.c. and d.c generators;
(v) transformers; 

[Image of step-down transformer diagram]

(vi) the induction coil.
(b) Inductance
(i) explanation of inductance;
(ii) unit of inductance;
(iii) energy stored in an inductor: E= 1/2 I^2 L
(iv) application/uses of inductors.
(c) Eddy Current
(i) reduction of eddy current
(ii) applications of eddy current

OBJECTIVES:
Candidates should be able to:
i. interpret the laws of electromagnetic induction;
ii. identify factors affecting induced emf;
iii. recognize how Lenz’s law illustrates the principle of conservation of energy;
iv. interpret the diagrammatic set up of A. C. generators;
v. identify the types of transformer;
vi. examine principles of operation of transformers;
vii. assess the functions of an induction coil;
viii. draw some conclusions from the principles of operation of an induction coil;
ix. interpret the inductance of an inductor;
x. recognize units of inductance;
xi. calculate the effective total inductance in series and parallel arrangement;
xii. deduce the expression for the energy stored in an inductor;
xiii. examine the applications of inductors;
xiv. describe the method by which eddy current losses can be reduced;
xv. determine ways by which eddy currents can be used.`
    },
    {
      name: 'Simple A. C. Circuits',
      content: `TOPICS/CONTENTS/NOTES:
(i) explanation of a.c. current and voltage;
(ii) peak and r.m.s. values;
(iii) a.c. source connected to a resistor;
(iv) a.c source connected to a capacitor- (capacitive reactance);
(v) a.c source connected to an inductor (inductive reactance);
(vi) R-L-C circuits; 

[Image of RLC circuit vector diagram]

(vii) vector diagram, phase angle and power factor;
(viii) resistance and impedance;
(ix) effective voltage in an R-L-C circuits;
(x) resonance and resonance frequency: F0 = 1 / 2pi sqrt(LC)

OBJECTIVES:
Candidates should be able to:
i. identify a.c. current and d.c. voltage;
ii. differentiate between the peak and r.m.s. values of a.c.;
iii. determine the phase difference between current and voltage;
iv. interpret R-L-C circuits;
v. analyse vector diagrams;
vi. calculate the effective voltage, reactance and impedance;
vii. recognize the condition by which the circuit is at resonance;
viii. determine the resonant frequency of R-L-C arrangement;
ix. determine the instantaneous power, average power and the power factor in a. c. circuits.`
    },
    {
      name: 'Conduction of Electricity Through Liquids and Gases',
      content: `TOPICS/CONTENTS/NOTES:
(a) liquids
(i) electrolytes and non-electrolyte;
(ii) concept of electrolysis;
(iii) Faraday’s laws of electrolysis;
(iv) application of electrolysis, e.g. electroplating, calibration of ammeter etc.
(b) gases
(i) discharge through gases (qualitative treatment only);
(ii) application of conduction of electricity through gases;

OBJECTIVES:
Candidates should be able to:
i. distinguish between electrolytes and non-electrolytes;
ii. analyse the processes of electrolysis;
iii. apply Faraday’s laws of electrolysis to solve problems;
iv. analyse discharge through gases;
v. determine some applications/uses of conduction of electricity through gases.`
    },
    {
      name: 'Elementary Modern Physics-Bohr’s Theory',
      content: `TOPICS/CONTENTS/NOTES:
(i) models of the atom and their limitations;
(ii) elementary structure of the atom;
(iii) energy levels and spectra;
(iv) thermionic and photoelectric emissions; 

[Image of photoelectric effect diagram]

(v) Einstein’s equation and stopping potential
(vi) applications of thermionic emissions and photoelectric effects;
(vii) simple method of production of x-rays;
(viii) properties and applications of alpha, beta and gamma rays;
(ix) half-life and decay constant;
(x) simple ideas of production of energy by fusion and fission;
(xi) binding energy, mass defect and Einstein’s Energy equation [ΔE = ΔMc2]
(xii) wave-particle (duality of matter);
(xiii) electron diffraction;
(xiv) the uncertainty principle.

OBJECTIVES:
Candidates should be able to:
i. identify the models of the atom and write their limitations;
ii. describe elementary structure of the atom;
iii. differentiate between the energy levels and spectra of atoms;
iv. compare thermionic emission and photoelectric emission;
v. apply Einstein’s equation to solve problems of photoelectric effect;
vi. calculate the stopping potential;
vii. relate some application of thermionic emission and photoelectric effects;
viii. interpret the process involved in the production of x-rays;
ix. identify some properties and applications of x-rays;
x. analyse elementary radioactivity;
xi. distinguish between stable and unstable nuclei;
xii. identify isotopes of an element;
xiii. compare the properties of alpha, beta and gamma rays;
xiv. relate half-life and decay constant of a radioactive element;
xv. determine the binding energy, mass defect and Einstein’s energy equation;
xvi. analyse wave particle duality;
xvii. solve some numerical problems based on the uncertainty principle and wave – particle duality.`
    },
    {
      name: 'Introductory Electronics',
      content: `TOPICS/CONTENTS/NOTES:
(i) distinction between metals, semiconductors and insulators (elementary knowledge of band gap is required);
(ii) intrinsic and extrinsic semiconductors (ntype and p-type semiconductors);
(iii) uses of semiconductors and diodes in rectification and transistors in amplification; 

[Image of PN junction diode biasing]

(iv) elementary knowledge of diodes and transistors.

OBJECTIVES:
Candidates should be able to:
i. differentiate between conductors, semiconductors and insulators;
ii. distinguish between intrinsic and extrinsic semiconductors (n-type and p-type semiconductors);
iii. distinguish between electron and hole carriers;
iv. analyse diodes and transistor
v. relate diodes to rectification and transistor to amplification.`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Ike, E.E. (2014). Essential Principles of Physics, Jos ENIC Publishers.
2. Ike, E.E. (2014). Numerical Problems and Solutions in Physics, Jos: ENIC Publishers.
3. Nelkon, M. (1977). Fundamentals of Physics, Great Britain: Hart Davis Education.
4. Nelkon, M. and Parker … (1989). Advanced Level Physics, (Sixth Edition): Heinemann.
5. Okeke, P.N. and Anyakoha, M.W. (2000). Senior Secondary School Physics, Lagos: Pacific Printers.
6. Olumuyiwa, Awe. and Ogunkoya, O. O. (1992). Comprehensive Certificate Physics, Ibadan: University Press Plc.`
    }
  ]
};

async function importPhysics() {
  console.log('⚛️ Starting Full JAMB Physics syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of PHYSICS_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: PHYSICS_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus with Image Tags'
          }
        })
        .select();
      
      if (error) throw error;
      
      console.log(`✅ Imported: ${topic.name}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed: ${topic.name} - ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Physics Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${PHYSICS_SYLLABUS.topics.length}`);
}

importPhysics().catch(console.error);
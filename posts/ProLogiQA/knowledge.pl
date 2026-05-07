% Context: Jupiter is a gas giant planet and the largest planet in the solar system.
planet(jupiter).
type(jupiter, gas_giant).
largest_in_solar_system(jupiter).

% Context: Its mass is 2.5 times the total mass of the other seven planets in the solar system.
mass_ratio(jupiter, others, 2.5).

% Context: Observations have found that most of the more than 70 moons surrounding Jupiter are composed of water ice.
has_moons(jupiter).
moon_count(jupiter, Count) :- Count > 70.
moons_composition(jupiter, water_ice).

% Context: Therefore, Jupiter's atmosphere should contain a considerable amount of water.
% This implies a rule connecting moon composition to planetary atmosphere, 
% likely supported by the assumption of common origin (Option 3).
atmosphere_contains_water(Planet) :-
    planet(Planet),
    moons_composition(Planet, water_ice),
    formed_from_same_material(Planet, moons).

% The fact supporting the conclusion (derived from the correct option)
formed_from_same_material(jupiter, moons).

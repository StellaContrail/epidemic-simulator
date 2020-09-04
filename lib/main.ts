/// <reference path="node_modules/@types/nouislider/index.d.ts" />

function pause(): void {
    if (status_next == STATUS_NEXT.PLAY) {
        status_next = STATUS_NEXT.PAUSE;
    }
}
function play(): void {
    if (status_next == STATUS_NEXT.PAUSE) {
        status_next = STATUS_NEXT.PLAY;
        window.requestAnimationFrame(update);
    }
    if (status_next == STATUS_NEXT.STOP) {
        status_next = STATUS_NEXT.PLAY;
        start();
    }
}
function reset(): void {
    status_next = STATUS_NEXT.PAUSE;
    start();
}

enum PARTICLE_STATUS { Susceptible, Infectious, Removed };
class Particle {
    position: Vector2;
    velocity: Vector2;
    obey_social_distance: boolean;
    status: PARTICLE_STATUS;
    infected_frames: number;
    is_quarantined: boolean;
    constructor(_position: Vector2, _velocity: Vector2, obey_social_distance: boolean) {
        this.position = _position;
        this.velocity = _velocity;
        this.obey_social_distance = obey_social_distance;

        this.status = PARTICLE_STATUS.Susceptible;
        this.infected_frames = 0;
        this.is_quarantined = false;
    }
    _random_walk = (speed_range: number) => {
        if (this.is_quarantined == false) {
            let alpha = Random.make(0, 1);
            let beta = Random.make(0, 1);
            let a = Math.sqrt(-2.0 * Math.log(alpha)) * Math.sin(2.0 * Math.PI * beta);
            let b = Math.sqrt(-2.0 * Math.log(alpha)) * Math.cos(2.0 * Math.PI * beta);
            this.velocity.x += speed_range * a;
            this.velocity.y += speed_range * b;
        }
    }
    _apply_velocity_limitation = (speed_limit) => {
        this.velocity.x = Math.abs(this.velocity.x) > speed_limit ? Math.sign(this.velocity.x) * speed_limit : this.velocity.x;
        this.velocity.y = Math.abs(this.velocity.y) > speed_limit ? Math.sign(this.velocity.y) * speed_limit : this.velocity.y;
    }
    _apply_boundary_condition = (boundary_condition) => {
        this.velocity.x += Math.exp(-(this.position.x - boundary_condition.xmin)) - Math.exp(this.position.x - boundary_condition.xmax);
        this.velocity.y += Math.exp(-(this.position.y - boundary_condition.ymin)) - Math.exp(this.position.y - boundary_condition.ymax);
    }
    _calculate_next_position = () => {
        return new Vector2(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
    }
    _apply_social_distancing = (repulsive_force_coefficient) => {
        if (this.obey_social_distance == false) return;
        if (this.is_quarantined) return;
        for (const other of particles) {
            if (this == other) continue;

            const r2 = Vector2.dis2( this._calculate_next_position(), other._calculate_next_position() );
            if (r2 <= SOCIAL_DISTANCE * SOCIAL_DISTANCE) {
                const vec = { x: this.position.x - other.position.x, y: this.position.y - other.position.y };
                this.velocity.x += repulsive_force_coefficient * vec.x / r2;
                this.velocity.y += repulsive_force_coefficient * vec.y / r2;
            }
        }
    }
    _update_status = () => {
        if (this.status != PARTICLE_STATUS.Infectious) return;
        this.infected_frames++;
        if (INFECTED_FRAMES_DURATION < this.infected_frames) {
            this.status = PARTICLE_STATUS.Removed;
            return;
        }
        if (this.is_quarantined) return;
        for (const other of particles) {
            if (this == other) continue;

            if (Vector2.dis2(this.position, other.position) < INFECTIOUS_RADIUS * INFECTIOUS_RADIUS) {
                if (other.status == PARTICLE_STATUS.Susceptible && Random.make(0, 1) < INFECTIOUS_PROBABILITY) {
                    other.status = PARTICLE_STATUS.Infectious;
                }
            }
        }
    }
    
    evolve() {
        const _canvas_simulation = canvas_list.get("simulation");
        const _canvas_quarantine = canvas_list.get("quarantine");

        // random walk
        this._random_walk(0.1);

        // apply velocity
        this.position = this._calculate_next_position();

        // apply boundary condition
        const canvas = this.is_quarantined ? _canvas_quarantine.canvas : _canvas_simulation.canvas;
        this._apply_boundary_condition( { xmin: 0, xmax: canvas.width, ymin: 0, ymax: canvas.height } );

        // social distancing
        this._apply_social_distancing(8);
        
        // infection / recovery
        this._update_status()

        // speed limit
        this._apply_velocity_limitation(0.8);
    }
}

class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    static dis2 = (r1: Vector2, r2: Vector2) => {
        let x_diff: number = r2.x - r1.x;
        let y_diff: number = r2.y - r1.y;
        return ( x_diff * x_diff + y_diff * y_diff );
    }
}
class Random {
    static make(...args: number[]): number {
        if (args.length >= 2) {
            let min: number = args[0];
            let max: number = args[1];
            return Math.random() * (max - min) + min;
        } else {
            return Math.random();
        }
    }
    // choose random items from an array without duplication
    static choices(array: Particle[], n: number): Particle[] {
        if (n > array.length) {
            throw new RangeError("Error: Random.choices()");
        }
        let choices_index: number[] = [];
        let result: Particle[] = [];
        let left: number = n;
        while(left > 0) {
            let index: number = Math.floor(Random.make(0, array.length));
            if (choices_index.includes(index) == false) {
                result.push(array[index]);
                choices_index.push(index);
                left--;
            }
        }
        return result;
    } 
}

class Canvas {
    id: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    constructor(id: string) {
        this.canvas = document.getElementById(id) as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    draw(...args: unknown[]): void {};
    reset(): void {};
}

interface ICanvasInformation {
    width: number,
    height: number,
    offset: { x: number, y: number }
}
class SimulationCanvas extends Canvas {
    constructor(id: string) {
        super(id);
    }
    draw(particle: Particle) {
        drawParticle(particle, this.canvas, this.context);
    }
    reset() {
        this.context.fillStyle = "#FFFFFF"
        this.context.fillRect(0, 0, this.width, this.height);
    }
    drawFPS(fps: number) {
        this.context.font = "1.15em 'Source Sans Pro'";
        this.context.fillStyle = "#B0C4DE";
        this.context.textAlign = "right";
        const padding_top = 20;
        const padding_right = 10;
        this.context.fillText(fps + " FPS", this.width - padding_right, padding_top);
    }
}

interface IStatisticalData {
    [PARTICLE_STATUS.Susceptible]: number,
    [PARTICLE_STATUS.Infectious]: number,
    [PARTICLE_STATUS.Removed]: number
}
class PlotCanvas extends Canvas {
    graph: ICanvasInformation;
    label: ICanvasInformation;
    axis: ICanvasInformation;

    constructor(id: string) {
        super(id);
        const X_AXIS_HEIGHT: number = 50;
        const LABEL_WIDTH  : number = 130;
        const GRAPH_WIDTH  : number = this.width - LABEL_WIDTH;
        const GRAPH_HEIGHT : number = this.height - X_AXIS_HEIGHT;
        const LABEL_HEIGHT : number = GRAPH_HEIGHT;
        const X_AXIS_WIDTH : number = GRAPH_WIDTH;
        this.graph = { width: GRAPH_WIDTH, height: GRAPH_HEIGHT, offset: { x: 5, y: 0 } };
        this.label = { width: LABEL_WIDTH, height: LABEL_HEIGHT, offset: { x: this.graph.width + 5 + this.graph.offset.x, y: 0 } };
        this.axis = { width: X_AXIS_WIDTH, height: X_AXIS_HEIGHT, offset: { x: this.graph.offset.x, y: this.graph.height } };
    }
    draw(stats: IStatisticalData[]) {
        const LAST_STATS = stats[stats.length - 1];
        const ratio_graph = (this.graph.height / PARTICLE_NUMBER);
        
        this.reset();

        if (stats.length > 0) {
            let plot = () => {
                const INFECT_PATH = new Path2D();
                INFECT_PATH.moveTo(this.graph.offset.x, this.graph.height + this.graph.offset.y);
                let x = 0;
                const dx = this.graph.width / (stats.length - 1);
                for (const event of stats) {
                    INFECT_PATH.lineTo(x + this.graph.offset.x, this.graph.height - ratio_graph * event[PARTICLE_STATUS.Infectious] + this.graph.offset.y);
                    x += dx;
                }
                INFECT_PATH.lineTo(this.graph.width + this.graph.offset.x, this.graph.height + this.graph.offset.y);
                INFECT_PATH.lineTo(this.graph.offset.x, this.graph.height + this.graph.offset.y);
                this.context.fillStyle = STATUS_COLOR.Infectious;
                this.context.fill(INFECT_PATH);

                const REMOVED_PATH = new Path2D();
                REMOVED_PATH.moveTo(this.graph.offset.x, this.graph.height + this.graph.offset.y);
                x = 0;
                for (const event of stats) {
                    REMOVED_PATH.lineTo(x + this.graph.offset.x, ratio_graph * event[PARTICLE_STATUS.Removed] + this.graph.offset.y);
                    x += dx;
                }
                REMOVED_PATH.lineTo(this.graph.width + this.graph.offset.x, this.graph.offset.y);
                REMOVED_PATH.lineTo(this.graph.offset.x, this.graph.offset.y);
                this.context.fillStyle = STATUS_COLOR.Removed;
                this.context.fill(REMOVED_PATH);
            }
            plot();
        }

        let setLabels = () => {
            const fontsize: number = 15;
            this.context.font = fontsize + "px 'Source Sans Pro'";
            this.context.textAlign = "left";

            const toPercent = (ratio: number) => { return (100 * ratio).toFixed(1); }

            let ratio = LAST_STATS[PARTICLE_STATUS.Removed] / PARTICLE_NUMBER;
            this.context.fillStyle = STATUS_COLOR.Removed;
            let y = 0.5 * ratio * this.label.height + this.label.offset.y;
            y = y < fontsize ? fontsize : y;
            this.context.fillText(toPercent(ratio) + "%  removed", this.label.offset.x, y);

            ratio = LAST_STATS[PARTICLE_STATUS.Susceptible] / PARTICLE_NUMBER;
            this.context.fillStyle = STATUS_COLOR.Susceptible;
            y = ((0.5 * LAST_STATS[PARTICLE_STATUS.Susceptible] + LAST_STATS[PARTICLE_STATUS.Removed]) / PARTICLE_NUMBER) * 
                this.label.height + this.label.offset.y;
            this.context.fillText(toPercent(ratio) + "%  susceptible", this.label.offset.x, y);

            ratio = LAST_STATS[PARTICLE_STATUS.Infectious] / PARTICLE_NUMBER;
            this.context.fillStyle = STATUS_COLOR.Infectious;
            this.context.fillText(toPercent(ratio) + "%  infected", this.label.offset.x, (1.0 - 0.5 * ratio) * this.label.height + this.label.offset.y);
        }
        setLabels();
        
        // Draw X Axis
        let setXAxis = () => {
            this.context.fillStyle = "Black";
            this.context.strokeStyle = "#656565";
            this.context.lineWidth = 1
            const FONTSIZE = 15;
            this.context.font = FONTSIZE + "px 'Source Sans Pro'";
            this.context.textAlign = "center";
            let dx = this.axis.width / infect_history.length;
            const SKIP_DATA_NUMBER = 100;
            for (let i = 0; i <= infect_history.length; i += SKIP_DATA_NUMBER) {
                this.context.beginPath();
                this.context.moveTo(dx * i + this.axis.offset.x, this.axis.offset.y - 5);
                this.context.lineTo(dx * i + this.axis.offset.x, this.axis.offset.y + 3);
                this.context.closePath();
                this.context.stroke();
                this.context.fillText((i / SKIP_DATA_NUMBER).toString(), dx * i + this.axis.offset.x, 15 + this.axis.offset.y);
            }
            this.context.fillText("Time", 0.5 * this.axis.width + this.axis.offset.x, this.axis.height + this.axis.offset.y - FONTSIZE * 0.5);
        }
        setXAxis();
    }
    reset() {
        // Clear
        this.context.fillStyle = "#FFFFFF"
        this.context.fillRect(0, 0, this.width, this.height);
        // Susceptible as background
        this.context.fillStyle = STATUS_COLOR.Susceptible;
        this.context.fillRect(this.graph.offset.x, this.graph.offset.y, this.graph.width, this.graph.height);
        // Border
        this.context.strokeStyle = "gray";
        this.context.lineWidth = 2;
        this.context.strokeRect(this.graph.offset.x, this.graph.offset.y, this.graph.width, this.graph.height);
    }
}

class QuarantineCanvas extends Canvas {
    constructor(id: string) {
        super(id);
    }
    draw(particle: Particle) {
        drawParticle(particle, this.canvas, this.context);
    }
    reset() {
        this.context.fillStyle = "#FFFFFF"
        this.context.fillRect(0, 0, this.width, this.height);
    }
}

const STATUS_NEXT = { PAUSE: 0, PLAY: 1, STOP: 2 };
const STATUS_COLOR = {  Susceptible: "#7AD9FF", Infectious: "#E24040", Removed: "#7F7F7F" };

let PARTICLE_NUMBER = 300;
let INFECTIOUS_RADIUS = 10;
let INFECTED_FRAMES_DURATION = 500;
let INFECTIOUS_PROBABILITY = 0.3;

let SOCIAL_DISTANCE = 10;
let SOCIAL_DISTANCE_PROBABILITY = 0.5;
let QUARANTINE_PROBABILITY = 0;
let ATTRACT_NUMBER = 5;

let status_next = STATUS_NEXT.PLAY;
let startTime: number;
let startTime_: number;
let particles: Particle[];
let infect_history: IStatisticalData[];

let canvas_list = new Map();
let tm_quarantine: TimeManagement;
let tm_attract: TimeManagement;
let tm_update: TimeManagement;

// Awake is called only 'once' when document is ready
function awake() {
    console.log("awake() called");
    canvas_list.set("simulation", new SimulationCanvas("simulation_graph"));
    canvas_list.set("plot", new PlotCanvas("counts_graph"));
    canvas_list.set("quarantine", new QuarantineCanvas("quarantine_graph"));

    if (canvas_list.has(undefined)) {
        document.write("Couldn't get the Canvas context");
        return;
    }

    start();
}

// Start is called before Update is fired.
function start() {
    console.log("start() called");
    startTime = new Date().getTime();
    startTime_ = new Date().getTime();
    particles = [];
    tm_quarantine = new TimeManagement();
    tm_attract = new TimeManagement();
    tm_update = new TimeManagement();

    document.getElementById("label_population").innerText = "Population";
    PARTICLE_NUMBER = parseInt(sliders.population.noUiSlider.get() as string);

    const INITIAL_INFECTED_NUMBER = 3;
    const DATA: IStatisticalData = [ PARTICLE_NUMBER - INITIAL_INFECTED_NUMBER, INITIAL_INFECTED_NUMBER, 0 ]
    infect_history = [ DATA ];

    // Create Initial Particles
    const _canvas = canvas_list.get("simulation");
    for (let i = 0; i < PARTICLE_NUMBER; i++) {
        let position: Vector2 = new Vector2(_canvas.width * Random.make(0.05, 0.95), _canvas.height * Random.make(0.05, 0.95));
        let velocity: Vector2 = new Vector2(Random.make(-0.8, 0.8), Random.make(-0.8, 0.8));
        let particle: Particle = new Particle(position, velocity, true);
        particles.push(particle);
    }
    Random.choices(particles, INITIAL_INFECTED_NUMBER).map(x => x.status = PARTICLE_STATUS.Infectious);
    Random.choices(particles, PARTICLE_NUMBER * ( 1 - SOCIAL_DISTANCE_PROBABILITY ) ).map(x => x.obey_social_distance = false);

    _canvas.reset();
    for (const particle of particles) {
        _canvas.draw(particle);
    }
    canvas_list.get("quarantine").reset();
    canvas_list.get("plot").reset();
    canvas_list.get("plot").draw(infect_history);
    updateCountDisplay(infect_history[0])

    if (status_next == STATUS_NEXT.PLAY) {
        update();
    }
}

function quarantine(particle: Particle, ratio: Vector2) {
    particle.is_quarantined = true;
    particle.position.x *= ratio.x;
    particle.position.y *= ratio.y;
    particle.velocity.x *= ratio.x;
    particle.velocity.y *= ratio.y;
}

function attract(chosen_particles: Particle[], spot: Vector2) {
    for (const chosen_particle of chosen_particles) {
        if (!chosen_particle.is_quarantined) {
            chosen_particle.position.x = spot.x;
            chosen_particle.position.y = spot.y;
        }
    }
}

function updateCountDisplay(counts: IStatisticalData) {
    const counts_element = document.getElementById("counts");
    counts_element.innerText = 
     "Removed: " + counts[PARTICLE_STATUS.Removed] + " (" + (100*counts[PARTICLE_STATUS.Removed]/PARTICLE_NUMBER).toFixed(1) + "%) " + 
     "Infectious: " + counts[PARTICLE_STATUS.Infectious] + " (" + (100*counts[PARTICLE_STATUS.Infectious]/PARTICLE_NUMBER).toFixed(1) + "%) " + 
     "Susceptible: " + counts[PARTICLE_STATUS.Susceptible] + " (" + (100*counts[PARTICLE_STATUS.Susceptible]/PARTICLE_NUMBER).toFixed(1) + "%)";
}

class TimeManagement {
    frames: number;
    is_elapsed: boolean;
    constructor() {
        this.frames = 0;
        this.is_elapsed = false;
    }
    suppressExecutionBySeconds(fps: number, sec: number, func: () => void) {
        this.frames++;
        if (this.frames / fps > sec) {
            this.is_elapsed = true;
        }
        if ( this.is_elapsed ) {
            this.is_elapsed = false;
            this.frames = 0;
            func();
        }
    }
    waitBySeconds(fps, sec) {
        this.frames++;
        if (this.frames / fps > sec) {
            this.is_elapsed = true;
        }
        if ( this.is_elapsed ) {
            this.is_elapsed = false;
            this.frames = 0;
            return true;
        } else {
            return false;
        }
    }
}

// Update is called once per frame, although the rate might change.
let update = () => {
    // Calculate FPS
    const FPS = Math.round( 1000 / ( new Date().getTime() - startTime ) );
    startTime = new Date().getTime();
    if (tm_update.waitBySeconds(FPS, 0.02) == false) { 
        requestAnimationFrame(update);
        return;
    }

    fixedUpdate();

    if (status_next == STATUS_NEXT.PLAY) {
        window.requestAnimationFrame(update);
    }
}

// FixedUpdate is called in each time interval.
let fixedUpdate = () => {
    // Calculate FPS
    const FPS = Math.round( 1000 / ( new Date().getTime() - startTime_ ) );
    startTime_ = new Date().getTime();

    const _canvas_simulation = canvas_list.get("simulation");
    const _canvas_quarantine = canvas_list.get("quarantine");

    _canvas_simulation.reset();
    _canvas_quarantine.reset();

    // Display FPS
    _canvas_simulation.drawFPS(FPS);
    
    
    let counts: IStatisticalData = [0, 0, 0];
    for (const particle of particles) {
        particle.evolve();
        counts[particle.status]++;
    }
    infect_history.push(counts);

    // Quarantine
    tm_quarantine.suppressExecutionBySeconds(FPS, 1, () => {
        let ratio = { 
            x: _canvas_quarantine.width / _canvas_simulation.width, 
            y: _canvas_quarantine.height / _canvas_simulation.height 
        };
        for (const particle of particles) {
            if (particle.status == PARTICLE_STATUS.Infectious && Math.random() < QUARANTINE_PROBABILITY && !particle.is_quarantined) {
                quarantine(particle, ratio);
            }
        }
    });
    
    // Attractive Spot
    const SPOT_WIDTH = 30;
    const SPOT_HEIGHT = 30;
    const SPOT_X = _canvas_simulation.width * 0.5 - SPOT_WIDTH * 0.5;
    const SPOT_Y = _canvas_simulation.height * 0.5 - SPOT_HEIGHT * 0.5;
    const SPOT_POS = { x: _canvas_simulation.width * 0.5, y: _canvas_simulation.height * 0.5 };
    if (ATTRACT_NUMBER > 0) {
        _canvas_simulation.context.strokeStyle = "gray";
        _canvas_simulation.context.strokeRect(SPOT_X, SPOT_Y, SPOT_WIDTH, SPOT_HEIGHT);
    }
    tm_attract.suppressExecutionBySeconds(FPS, 1, () => {
        if (ATTRACT_NUMBER > 0) {
            let chosen_particles = Random.choices(particles, ATTRACT_NUMBER)
            attract(chosen_particles, SPOT_POS);
        }
    });
        

    // Draw Particles
    for (const particle of particles) {
        if (particle.is_quarantined) {
            _canvas_quarantine.draw(particle);
        } else {
            _canvas_simulation.draw(particle);
        }
    }

    updateCountDisplay(counts);
    
    // Draw Plot
    canvas_list.get("plot").draw(infect_history);

    // Forward or End the Simulation
    let infected_count = particles.filter(particle => particle.status == PARTICLE_STATUS.Infectious).length;
    if (status_next == STATUS_NEXT.PLAY && infected_count == 0) {
        status_next = STATUS_NEXT.STOP;
    }
}


let drawParticle = (particle, canvas, context) => {
    context.beginPath();
    context.arc(particle.position.x, particle.position.y, 4, 0, 2 * Math.PI);
    switch(particle.status) {
        case PARTICLE_STATUS.Susceptible:
        context.fillStyle = STATUS_COLOR.Susceptible;
        break;
        case PARTICLE_STATUS.Infectious:
        context.fillStyle = STATUS_COLOR.Infectious;
        break;
        case PARTICLE_STATUS.Removed:
        context.fillStyle = STATUS_COLOR.Removed;
        break;
    }
    context.closePath();
    context.fill();

    if (particle.status == PARTICLE_STATUS.Infectious) {
        context.beginPath();
        context.strokeStyle = "orange";
        context.arc(particle.position.x, particle.position.y, INFECTIOUS_RADIUS, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();
    }
}

const sliders = {
    population: document.getElementById("slider_population") as noUiSlider.Instance,
    infect_radius: document.getElementById("slider_infect_radius") as noUiSlider.Instance,
    infect_duration: document.getElementById("slider_infect_duration") as noUiSlider.Instance,
    infect_probability: document.getElementById("slider_infect_probability") as noUiSlider.Instance,
    sd_radius: document.getElementById("slider_sd_radius") as noUiSlider.Instance,
    sd_probability: document.getElementById("slider_sd_probability") as noUiSlider.Instance,
    quarantine_probability: document.getElementById("slider_quarantine_probability") as noUiSlider.Instance,
    attract_probability: document.getElementById("slider_attract_probability") as noUiSlider.Instance
};
const tooltips_nodes = document.getElementsByClassName("noUi-tooltip") as HTMLCollectionOf<HTMLElement>;

noUiSlider.create( sliders.population, {
    start: 300,
    range: {
        "min": [0],
        "max": [500]
    },
    step: 1,
    format: {
        to: (val) => { return Math.round(val); },
        from: (val) => { return val; }
    },
    connect: "lower",
    tooltips: true
});
noUiSlider.create( sliders.infect_radius, {
    start: 10,
    range: {
        "min": [0],
        "max": [20]
    },
    connect: "lower",
    tooltips: true
});
noUiSlider.create( sliders.infect_duration, {
    start: 300,
    range: {
        "min": [0],
        "max": [1000]
    },
    step: 50,
    format: {
        to: (val) => { return Math.round(val); },
        from: (val) => { return val; }
    },
    connect: "lower",
    tooltips: true
});
noUiSlider.create( sliders.infect_probability, {
    start: 0.3,
    range: {
        "min": [0],
        "max": [1]
    },
    connect: "lower",
    tooltips: true
});
noUiSlider.create( sliders.sd_radius, {
    start: 10,
    range: {
        "min": [0],
        "max": [20]
    },
    connect: "lower",
    tooltips: true
});
noUiSlider.create( sliders.sd_probability, {
    start: 0.5,
    range: {
        "min": [0],
        "max": [1]
    },
    connect: "lower",
    tooltips: true
});
noUiSlider.create( sliders.quarantine_probability, {
    start: 0.0,
    range: {
        "min": [0],
        "max": [1]
    },
    connect: "lower",
    tooltips: true
});
noUiSlider.create( sliders.attract_probability, {
    start: 0.02,
    range: {
        "min": [0],
        "max": [1]
    },
    connect: "lower",
    tooltips: true
});

sliders.population.noUiSlider.on( "update", (vals) => {
    let node = document.getElementById("label_population");
    if (vals[0] != PARTICLE_NUMBER) {
        node.innerHTML = "Population <span style='color: red;'>*NEED TO RESTART</span>"
    } else {
        node.innerHTML = "Population"
    }
});
sliders.infect_radius.noUiSlider.on( "update", (vals) => {
    INFECTIOUS_RADIUS = vals[0];
});
sliders.infect_duration.noUiSlider.on( "update", (vals) => {
    INFECTED_FRAMES_DURATION = vals[0];
});
sliders.infect_probability.noUiSlider.on( "update", (vals) => {
    INFECTIOUS_PROBABILITY = vals[0];
});
sliders.sd_radius.noUiSlider.on( "update", (vals) => {
    SOCIAL_DISTANCE = vals[0];
});
sliders.sd_probability.noUiSlider.on( "set", (vals) => {
    if (SOCIAL_DISTANCE_PROBABILITY != vals[0]) {
        SOCIAL_DISTANCE_PROBABILITY = vals[0];
        for (const particle of particles) {
            particle.obey_social_distance = false;
        }
        Random.choices(particles, PARTICLE_NUMBER * SOCIAL_DISTANCE_PROBABILITY).map( x => x.obey_social_distance = true );
    }
});
sliders.quarantine_probability.noUiSlider.on( "update", (vals) => {
    QUARANTINE_PROBABILITY = vals[0];
});
sliders.attract_probability.noUiSlider.on( "update", (vals) => {
    ATTRACT_NUMBER = Math.round(vals[0] * PARTICLE_NUMBER);
});

for ( const key in sliders ) {
    sliders[key].noUiSlider.on( "slide", (vals) => {
        sliders[key].getElementsByClassName("noUi-tooltip")[0].style.opacity = 1.0;
    });
    sliders[key].noUiSlider.on( "end", (vals) => {
        sliders[key].getElementsByClassName("noUi-tooltip")[0].style.opacity = 0.3;
    });
}

for ( const tooltips_node of tooltips_nodes ) {
    tooltips_node.addEventListener( "mouseover", (event) => {
        tooltips_node.style.opacity = "1.0";
    });
    tooltips_node.addEventListener( "mouseout", (event) => {
        tooltips_node.style.opacity = "0.3";
    });
}

console.log("calling awake()")
document.addEventListener("DOMContentLoaded", awake);
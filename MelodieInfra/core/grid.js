import {floor, iterable, lru_cache, randint, random} from './api';
import {ClassVar, Dict, List, Tuple} from './types';
import {Agent} from './agent';
var _pj;
function _pj_snippets(container) {
    function _assert(comp, msg) {
        function PJAssertionError(message) {
            this.name = "PJAssertionError";
            this.message = (message || "Custom error PJAssertionError");
            if (((typeof Error.captureStackTrace) === "function")) {
                Error.captureStackTrace(this, this.constructor);
            } else {
                this.stack = new Error(message).stack;
            }
        }
        PJAssertionError.prototype = Object.create(Error.prototype);
        PJAssertionError.prototype.constructor = PJAssertionError;
        msg = (msg || "Assertion failed.");
        if ((! comp)) {
            throw new PJAssertionError(msg);
        }
    }
    function in_es6(left, right) {
        if (((right instanceof Array) || ((typeof right) === "string"))) {
            return (right.indexOf(left) > (- 1));
        } else {
            if (((right instanceof Map) || (right instanceof Set) || (right instanceof WeakMap) || (right instanceof WeakSet))) {
                return right.has(left);
            } else {
                return (left in right);
            }
        }
    }
    container["_assert"] = _assert;
    container["in_es6"] = in_es6;
    return container;
}
_pj = {};
_pj_snippets(_pj);
class GridItem extends Agent {
    constructor(agent_id, grid, x = 0, y = 0) {
        super(agent_id);
        this.grid = grid;
        this.x = x;
        this.y = y;
    }
}
class GridAgent extends GridItem {
    constructor(agent_id, x = 0, y = 0, grid = null) {
        super(agent_id, grid, x, y);
        this.category = (- 1);
        this.set_category();
        _pj._assert((this.category >= 0), "Category should be larger or ");
    }
    set_category() {
        /*
        Set the category of GridAgent.

        As there may be more than one types of agent wandering around the grid, `category` is used to tell the type of
        `GridAgent`. So be sure to inherit this method in custom GridAgent implementation.

        :return: int
        */
        throw new NotImplementedError("Category should be set for GridAgent");
    }
    rand_move_agent(x_range, y_range) {
        /*
        Randomly move to a new position within x and y range.

        :return: None
        */
        if ((this.grid === null)) {
            throw new ValueError("Grid Agent has not been registered onto the grid!");
        }
        [this.x, this.y] = this.grid.rand_move_agent(this, this.category, x_range, y_range);
    }
}
class Spot extends GridItem {
    constructor(spot_id, grid, x = 0, y = 0) {
        super(spot_id, grid, x, y);
        this.grid = grid;
        this.colormap = 0;
    }
    get_spot_agents() {
        /*
        Get all agents on the spot.

        :return: a list of grid agent.
        */
        return this.grid.get_spot_agents(this);
    }
    get_style() {
        return {"backgroundColor": "#ffffff"};
    }
}
class Grid {
    /*
    Grid is a widely-used discrete space for ABM.
    Grid contains many `Spot`s, each `Spot` could contain several agents.
    */
    constructor(spot_cls, scenario = null) {
        /*
        :param spot_cls: The class of Spot
        :param width: The width of Grid
        :param height: The height of Grid
        :param wrap: If true, the coordinate overflow will be mapped to another end.
        :param caching: If true, the neighbors and bound check results will be cached to avoid re-computing.
        */
        this._width = (- 1);
        this._height = (- 1);
        this._wrap = false;
        this._caching = true;
        this._multi = false;
        this._spot_cls = spot_cls;
        this._existed_agents = {};
        this._agent_ids = {};
        this._spots = [];
        this.scenario = scenario;
        this._empty_spots = set();
        this._agent_containers = {};
        this._cache = {};
    }
    init_grid() {
        var SpotCls;
        SpotCls = this._spot_cls;
        this._spots = function () {
    var _pj_a = [], _pj_b = range(this._height);
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var y = _pj_b[_pj_c];
        _pj_a.push(function () {
    var _pj_e = [], _pj_f = range(this._width);
    for (var _pj_g = 0, _pj_h = _pj_f.length; (_pj_g < _pj_h); _pj_g += 1) {
        var x = _pj_f[_pj_g];
        _pj_e.push(new SpotCls(this._convert_to_1d(x, y), this, x, y));
    }
    return _pj_e;
}
.call(this));
    }
    return _pj_a;
}
.call(this);
        for (var x = 0, _pj_a = this._width; (x < _pj_a); x += 1) {
            for (var y = 0, _pj_b = this._height; (y < _pj_b); y += 1) {
                this._spots[y][x].setup();
                this._empty_spots.add(this._convert_to_1d(x, y));
            }
        }
        this._roles_list = function () {
    var _pj_a = [], _pj_b = range((this._width * this._height));
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var i = _pj_b[_pj_c];
        _pj_a.push(function () {
    var _pj_e = [], _pj_f = range(4);
    for (var _pj_g = 0, _pj_h = _pj_f.length; (_pj_g < _pj_h); _pj_g += 1) {
        var j = _pj_f[_pj_g];
        _pj_e.push(0);
    }
    return _pj_e;
}
.call(this));
    }
    return _pj_a;
}
.call(this);
    }
    setup_params(width, height, wrap = true, caching = true, multi = true) {
        /*
        Setup the parameters of grid.

        :param width: int
        :param height: int
        :param wrap: bool, True by default.
        If True, GridAgent will re-enter the grid on the other side if it moves out of the grid on one side.
        :param caching: bool, True by default. If true, the grid caches the neighbor of each spot.
        :param multi: bool, True by default. If true, more than one agent could stand on one spot. If false, error will
        be raised when attempting to place multiple agents on one spot.
        :return: None
        */
        this._width = width;
        this._height = height;
        this._wrap = wrap;
        this._caching = caching;
        this._multi = multi;
        this.init_grid();
    }
    setup() {
        /*
        Be sure to inherit this function.

        :return: None
        */
    }
    _setup() {
        this.setup();
    }
    add_category(category_name) {
        /*
        Add agent category
        :param category_name:
        :return:
        */
        this._agent_ids[category_name] = function () {
    var _pj_a = [], _pj_b = range((this._width * this._height));
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var i = _pj_b[_pj_c];
        _pj_a.push(set());
    }
    return _pj_a;
}
.call(this);
        this._existed_agents[category_name] = {};
    }
    get_spot(x, y) {
        /*
        Get a ``Spot`` at position ``(x, y)``

        :param x:
        :param y:
        :return: The ``Spot`` at position (x, y)
        */
        [x, y] = this._bound_check(x, y);
        return this._spots[y][x];
    }
    get_agent_ids(category, x, y) {
        /*
        Get all agent of a specific category from the spot at (x, y)
        :param category:
        :param x:
        :param y:
        :return: A set of int, the agent ids.
        */
        var agent_ids;
        agent_ids = this._agent_ids[category][this._convert_to_1d(x, y)];
        if ((agent_ids === null)) {
            throw new KeyError(`Category ${category} not registered!`);
        }
        return agent_ids;
    }
    _convert_to_1d(x, y) {
        return ((x * this._height) + y);
    }
    _num_to_2d_coor(num) {
        return [floor((num / this._height)), (num % this._width)];
    }
    _in_bounds(x, y) {
        return (((0 <= x) && (x < this.width)) && ((0 <= y) && (y <= this._height)));
    }
    _get_category_of_agents(category_name) {
        return this._existed_agents[category_name];
    }
    _bound_check(x, y) {
        if (this._wrap) {
            return this.coords_wrap(x, y);
        }
        if ((! ((0 <= x) && (x < this._width)))) {
            throw new IndexError("grid index x was out of range");
        } else {
            if ((! ((0 <= y) && (y <= this._height)))) {
                throw new IndexError("grid index y was out of range");
            } else {
                return [x, y];
            }
        }
    }
    coords_wrap(x, y) {
        /*
        Wrap the coordination
        :param x:
        :param y:
        :return:
        */
        var x_wrapped, y_wrapped;
        [x_wrapped, y_wrapped] = [(x % this._width), (y % this._height)];
        x_wrapped = ((x_wrapped >= 0) ? x_wrapped : (this._width + x_wrapped));
        y_wrapped = ((y_wrapped >= 0) ? y_wrapped : (this._height + y_wrapped));
        return [x_wrapped, y_wrapped];
    }
    _get_neighbor_positions(x, y, radius = 1, moore = true, except_self = true) {
        /*
        Get the neighbors of some spot.

        :param x:
        :param y:
        :param radius:
        :param moore:
        :param except_self:
        :return:
        */
        var neighbors, s;
        [x, y] = this._bound_check(x, y);
        neighbors = [];
        s = `${except_self}+${moore}+${radius}+${x}+${y}`;
        if ((! _pj.in_es6(s, this._cache))) {
            for (var dx = (- radius), _pj_a = (radius + 1); (dx < _pj_a); dx += 1) {
                for (var dy = (- radius), _pj_b = (radius + 1); (dy < _pj_b); dy += 1) {
                    if (((! moore) && ((abs(dx) + abs(dy)) > radius))) {
                        continue;
                    }
                    if (((! this._wrap) && (! this._in_bounds((x + dx), (y + dy))))) {
                        continue;
                    }
                    if ((((dx === 0) && (dy === 0)) && except_self)) {
                        continue;
                    }
                    neighbors.append(this._bound_check((x + dx), (y + dy)));
                }
            }
            this._cache[s] = neighbors;
            return neighbors;
        } else {
            return this._cache[s];
        }
    }
    _get_neighborhood(x, y, radius = 1, moore = true, except_self = true) {
        /*
        Get all spots around (x, y)

        */
        var neighbor_positions, spots;
        neighbor_positions = this._get_neighbor_positions(x, y, radius, moore, except_self);
        spots = [];
        for (var pos, _pj_c = 0, _pj_a = neighbor_positions, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            pos = _pj_a[_pj_c];
            [x, y] = pos;
            spots.append(this.get_spot(x, y));
        }
        return spots;
    }
    get_agent_neighborhood(agent, radius = 1, moore = true, except_self = true) {
        return this._get_neighborhood(agent.x, agent.y, radius, moore, except_self);
    }
    get_spot_neighborhood(spot, radius = 1, moore = true, except_self = true) {
        return this._get_neighborhood(spot.x, spot.y, radius, moore, except_self);
    }
    add_agent(agent) {
        /*
        Add an agent to the grid

        :param agent: An GridAgent object.
        :param category: A string, the name of category. The category should be registered.
        :return:
        */
        agent.grid = this;
        this._add_agent(agent.id, agent.category, agent.x, agent.y);
    }
    _add_agent(agent_id, category, x, y) {
        /*
        Add agent onto the grid
        :param agent_id:
        :param category:
        :param x:
        :param y:
        :return:
        */
        var category_of_agents, l, pos_1d;
        [x, y] = this._bound_check(x, y);
        if ((! _pj.in_es6(category, this._existed_agents))) {
            this._existed_agents[category] = {};
        }
        if ((! _pj.in_es6(category, this._agent_ids))) {
            l = [];
            for (var _ = 0, _pj_a = (this._width * this._height); (_ < _pj_a); _ += 1) {
                l.append(set());
            }
            this._agent_ids[category] = l;
        }
        category_of_agents = this._get_category_of_agents(category);
        if (_pj.in_es6(agent_id, category_of_agents)) {
            throw new ValueError(`Agent with id: ${agent_id} already exists on grid!`);
        }
        pos_1d = this._convert_to_1d(x, y);
        if (_pj.in_es6(agent_id, this._agent_ids[category][pos_1d])) {
            throw new ValueError(`Agent with id: ${agent_id} already exists at position ${[x, y]}!`);
        } else {
            this._agent_ids[category][pos_1d].add(agent_id);
            this._existed_agents[category][agent_id] = [x, y];
        }
        if (_pj.in_es6(pos_1d, this._empty_spots)) {
            this._empty_spots.remove(pos_1d);
        }
    }
    _remove_agent(agent_id, category, x, y) {
        var agents, category_of_agents, pos_1d;
        [x, y] = this._bound_check(x, y);
        category_of_agents = this._get_category_of_agents(category);
        if ((! _pj.in_es6(agent_id, category_of_agents.keys()))) {
            throw new ValueError(`Agent with id: ${agent_id} does not exist on grid!`);
        }
        pos_1d = this._convert_to_1d(x, y);
        if ((! _pj.in_es6(agent_id, this._existed_agents[category]))) {
            throw new ValueError("Agent does not exist on the grid!");
        }
        if ((! _pj.in_es6(agent_id, this._agent_ids[category][pos_1d]))) {
            console.log("Melodie-boost error occured. agent_id:", agent_id, "x:", x, "y:", y);
            throw new IndexError("agent_id does not exist on such coordinate.");
        } else {
            this._agent_ids[category][pos_1d].remove(agent_id);
            this._existed_agents[category].pop(agent_id);
        }
        agents = this._get_spot_agents(pos_1d);
        if ((agents.length === 0)) {
            this._empty_spots.add(pos_1d);
        }
    }
    remove_agent(agent) {
        /*
        Remove agent from the grid

        :param agent:
        :return:
        */
        var source_x, source_y;
        [source_x, source_y] = this.get_agent_pos(agent.id, agent.category);
        this._remove_agent(agent.id, agent.category, source_x, source_y);
    }
    move_agent(agent, target_x, target_y) {
        /*
        Move agent to target position.
        :param agent_id:
        :param category:
        :param target_x:
        :param target_y:
        :return:
        */
        var source_x, source_y;
        [source_x, source_y] = this.get_agent_pos(agent.id, agent.category);
        this._remove_agent(agent.id, agent.category, source_x, source_y);
        this._add_agent(agent.id, agent.category, target_x, target_y);
        [agent.x, agent.y] = [target_x, target_y];
    }
    get_agent_pos(agent_id, category) {
        /*
        Get the agent position at the grid.
        :param agent_id:
        :param category:
        :return:
        */
        return this._existed_agents[category][agent_id];
    }
    height() {
        /*
        Get the height of grid

        :return: height, an ``int``
        */
        return this._height;
    }
    width() {
        /*
        Get the width of grid

        :return: width, an ``int``
        */
        return this._width;
    }
    get_neighbors(agent, radius = 1, moore = true, except_self = true) {
        /*
        Get the neighbors of one spot at (x, y).

        :param x:
        :param y:
        :param radius:
        :param moore:
        :param except_self:
        :return:  A list of the tuple: (`Agent category`, `Agent id`).
        */
        var agent_ids, neighbor_ids, neighbor_positions, x, y;
        neighbor_ids = [];
        neighbor_positions = this._get_neighbor_positions(agent.x, agent.y, radius, moore, except_self);
        for (var neighbor_pos, _pj_c = 0, _pj_a = neighbor_positions, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            neighbor_pos = _pj_a[_pj_c];
            [x, y] = neighbor_pos;
            agent_ids = this.get_spot_agents(this.get_spot(x, y));
            neighbor_ids.extend(agent_ids);
        }
        return neighbor_ids;
    }
    get_spot_agents(spot) {
        /*
        Get agents on the spot.

        */
        return this._get_spot_agents(spot.id);
    }
    _get_spot_agents(spot_id) {
        var category, l, spot_set_list;
        l = [];
        for (var item of this._agent_ids.items()) {
            [category, spot_set_list] = item;
            for (var agent_id, _pj_c = 0, _pj_a = spot_set_list[spot_id], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                agent_id = _pj_a[_pj_c];
                l.append([category, agent_id]);
            }
        }
        return l;
    }
    get_colormap() {
        /*
        Get the role of each spot.

        :return: A tuple. The first item is a nested list for spot roles, and the second item is a dict for agent roles.
        */
        var agent_category, agent_id, agents_series_data, pos_1d, role_pos_list, series_data_one_category, spot;
        agents_series_data = {};
        for (var category, _pj_c = 0, _pj_a = this._agent_ids.keys(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            category = _pj_a[_pj_c];
            agents_series_data[category] = [];
        }
        for (var x = 0, _pj_a = this._width; (x < _pj_a); x += 1) {
            for (var y = 0, _pj_b = this._height; (y < _pj_b); y += 1) {
                spot = this.get_spot(x, y);
                pos_1d = this._convert_to_1d(x, y);
                role_pos_list = this._roles_list[pos_1d];
                role_pos_list[0] = x;
                role_pos_list[1] = y;
                role_pos_list[2] = 0;
                role_pos_list[3] = spot.colormap;
                for (var agent_desc, _pj_e = 0, _pj_c = this.get_spot_agents(spot), _pj_d = _pj_c.length; (_pj_e < _pj_d); _pj_e += 1) {
                    agent_desc = _pj_c[_pj_e];
                    [agent_category, agent_id] = agent_desc;
                    series_data_one_category = agents_series_data[agent_category];
                    series_data_one_category.append({"value": [x, y], "id": agent_id, "category": agent_category});
                }
            }
        }
        return [this._roles_list, agents_series_data];
    }
    spots_to_json() {
        /*
        Convert spots in this grid into a list of json-serializable dict

        :return: JSON serializable list
        */
        var spot, spots_serialized;
        spots_serialized = [];
        for (var x = 0, _pj_a = this.width(); (x < _pj_a); x += 1) {
            for (var y = 0, _pj_b = this.height(); (y < _pj_b); y += 1) {
                spot = this._spots[y][x];
                spots_serialized.append(spot.to_json());
            }
        }
        return spots_serialized;
    }
    get_empty_spots() {
        /*
        Get all empty spots from grid.

        :return: a list of empty spot coordinates.
        */
        var positions;
        positions = [];
        for (var spot_pos_1d, _pj_c = 0, _pj_a = this._empty_spots, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            spot_pos_1d = _pj_a[_pj_c];
            positions.append(this._num_to_2d_coor(spot_pos_1d));
        }
        return positions;
    }
    find_empty_spot() {
        var i, rand_value;
        rand_value = randint(0, (this._empty_spots.length - 1));
        i = 0;
        for (var item, _pj_c = 0, _pj_a = this._empty_spots, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            item = _pj_a[_pj_c];
            if ((i === rand_value)) {
                return this._num_to_2d_coor(item);
            }
            i += 1;
        }
    }
    setup_agent_locations(category, initial_placement = "direct") {
        /*
        Add an agent category.

        For example, if there are two classes of agents: `Wolf(GridAgent)` and `Sheep(GridAgent)`,
        and there are 100 agents with id 0~99 for each class. It is obvious in such a circumstance that
        we cannot identify an agent only with agent *id*.So it is essential to use *category_name* to distinguish two types of agents.

        :param category_id: The id of new category.
        :param category: An AgentList object
        :param initial_placement: A str object stand for initial placement.
        :return: None
        */
        initial_placement = initial_placement.lower();
        this._add_agent_container(category, initial_placement);
    }
    _add_agent_container(category, initial_placement) {
        var agent, category_id, pos;
        _pj._assert((category !== null), `Agent Container was None`);
        agent = category[0];
        category_id = agent.category;
        _pj._assert((! _pj.in_es6(category_id, this._agent_containers)), `Category ID ${category_id} already existed!`);
        this._agent_containers[category_id] = category;
        _pj._assert(_pj.in_es6(initial_placement, ["random_single", "direct"]), `Invalid initial placement '${initial_placement}' `);
        if ((initial_placement === "random_single")) {
            for (var agent, _pj_c = 0, _pj_a = category, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                agent = _pj_a[_pj_c];
                pos = this.find_empty_spot();
                agent.x = pos[0];
                agent.y = pos[1];
                this.add_agent(agent);
            }
        } else {
            if ((initial_placement === "direct")) {
                for (var agent, _pj_c = 0, _pj_a = category, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                    agent = _pj_a[_pj_c];
                    this.add_agent(agent);
                }
            }
        }
    }
    rand_move_agent(agent, category, range_x, range_y) {
        /*
        Randomly move an agent with maximum movement `range_x` in x axis and `range_y` in y axis.

        :param agent: Must be `Melodie.GridAgent`, not `Agent`. That is because `GridAgent` has predefined properties required in `Grid`.
        :param range_x: The activity range of agent on the x axis.
        :param range_y: The activity range of agent on the y axis.

        For example, if the agent is at `(0, 0)`, `range_x=1` and `range_y=0`, the result can be
        `(-1, 0), (0, 0) or (1, 0)`. The probability of these three outcomes are equal.

        :return: (int, int), the new position
        */
        var dx, dy, source_x, source_y, target_x, target_y;
        source_x = agent.x;
        source_y = agent.y;
        this._remove_agent(agent.id, category, source_x, source_y);
        dx = (floor((random() * ((2 * range_x) + 1))) - range_x);
        dy = (floor((random() * ((2 * range_y) + 1))) - range_y);
        target_x = (source_x + dx);
        target_y = (source_y + dy);
        this._add_agent(agent.id, category, target_x, target_y);
        return this.coords_wrap(target_x, target_y);
    }
}
export {GridAgent, GridItem, Spot, Grid};

//# sourceMappingURL=grid.js.map

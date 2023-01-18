import { AgentList } from "./agent_list";
import { Grid } from "./grid";
const Parallel = require('paralleljs');
function patchArrayMethods() {
    (Array.prototype as any)['append'] = Array.prototype.push
}

export function patchAgentList(AgentList: any) {
    AgentList.prototype[Symbol.iterator] = function () {
        var index = 0;
        const data = this.agents;

        return {
            next: function () {
                return { value: data[++index], done: !(index in data) }
            }
        };
    };
}

export function patch() {
    patchArrayMethods()
}

(window as any)['time'] = {
    time: () => Date.now() / 1000.0
};

(window as any)['random'] = {
    random: Math.random,
    randint: (a: number, b: number) => {
        return Math.floor(Math.random() * (b - a + 1)) + a;
    },
    normalvariate: (mu: number, sigma: number) => {
        if (mu === void 0) {
            mu = 0;
        }
        if (sigma === void 0) {
            sigma = 1;
        }
        var x, y, r;
        do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            r = x * x + y * y;
        } while (!r || r > 1);
        return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r);
    }
}

export interface BaseComponent {
    type: string
    cls: string
    prop_name: string
}

export interface EnvironmentComponent extends BaseComponent {
    type: "environment"
    prop_name: "environment"
    data: { [key: string]: any }
}

export interface AgentContainerComponent extends BaseComponent {
    type: "agent_list"
    agent_cls: string
    agents: { [key: string]: any }[]
    category: string
}

export interface GridComponent extends BaseComponent {
    type: "grid"
    width: number
    height: number
    spots: { [key: string]: any }[]
    spot_cls: string
    // existed_agents: { [key: string]: { [key: string]: [number, number] } }
    // agent_ids: { [key: string]: number[][] }
    categories: string[]
    // agent_list_names: string[]
    // agents: { [key: string]: any }[]
}

export interface ModelData {
    model_cls: string,

    scenario: {
        cls: string
        data: { [key: string]: any }
    },
    components: (EnvironmentComponent | AgentContainerComponent | GridComponent)[]

}

function create2DArray(height: number, width: number): null[][] {
    const arr = []
    for (let i = 0; i < height; i++) {
        const row = []
        for (let j = 0; j < width; j++) {
            row.push(null)
        }
        arr.push(row)
    }
    return arr
}

function getAgentListData(data: ModelData, category: string): AgentContainerComponent {
    const componentData = data.components.find((item) => item.type == 'agent_list' && item.category == category)
    if (componentData != null) {
        return (componentData as unknown as AgentContainerComponent)
    } else {
        throw Error(`category ${category} does not exist!`)
    }
}

function unmarshallModel(data: ModelData) {
    const model = new (eval(data.model_cls))()
    // model.setup()
    model.scenario = new (eval(data.scenario['cls']))()
    for (const k in data.scenario.data) {
        model.scenario[k] = data.scenario.data[k]
    }
    const agentLists: { [key: string]: AgentList } = {}
    for (const component of data.components) {
        if (component.type == "environment") {
            model.environment = new (eval(component['cls']))()
        } else if (component.type == "agent_list") {
            model[component.prop_name] = new (eval(component['cls']))(
                (eval(component['agent_cls'])), component['agents'].length, model)
            const agents = []
            const agent_cls = eval(component['agent_cls'])
            for (const agent_data of component['agents']) {
                const agent = new agent_cls()
                for (const k in agent_data) {
                    agent[k] = agent_data[k]
                }
                agent.model = model
                agents.push(agent)
            }
            model[component.prop_name].agents = agents
            agentLists[component.category] = model[component.prop_name]
        } else if (component.type == 'grid') {
            const grid: Grid = new (eval(component['cls']))(
                (eval(component.spot_cls)), model.scenario)
            grid._width = component.width
            grid._height = component.height
            model[component.prop_name] = grid
            grid._spots = create2DArray(component.height, component.width)
            for (const category of component.categories) {
                const agentList = agentLists[category]
                console.log(agentLists, category)
                for (const agent of agentList.agents) {
                    grid.add_agent(agent)
                }
                // const agentListData = getAgentListData(data, category)
                // for()
            }
            // grid._existed_agents = component.existed_agents
            // grid._agent_ids = {}
            // for (const key in component.existed_agents) {
            //     grid._agent_ids[key] = []
            //     for (let i = 0; i < component.width * component.height; i++) {
            //         const set = new Set()
            //         for (const agent_id of component.agent_ids[key][i]) {
            //             set.add(agent_id)
            //         }
            //         grid._agent_ids[key].push(set)

            //     }
            // }
            const spot_type = (eval(component['spot_cls']))
            for (const spotData of component.spots) {
                const { y, x } = spotData
                const spot = new spot_type()
                for (const k in spotData) {
                    spot[k] = spotData[k]
                }
                spot.model = model
                grid._spots[y][x] = spot
            }
        }
    }
    return model
}
(window as any)['unmarshallModel'] = unmarshallModel;
(window as any)['set'] = () => new Set()
const l = []
for (let i = 0; i < 1000; i++) {
    l.push(i)
}
// let p = new Parallel(l, { env: { a: 0 }, envNamespace: 'parallel' });
// const log = function () { console.log(arguments); };
// // One gotcha: anonymous functions cannot be serialzed
// // If you want to do recursion, make sure the function
// // is named appropriately
// function fib(n: number): number {
//     console.log(n, AgentList);
//     // (global as any).parallel.a += 1;
//     return n;
// };
// p.map(fib).then(log)
// Logs the first 7 Fibonnaci numbers, woot!
import functools
import math
import random
from typing import ClassVar, Set, Dict, List, Tuple

import numpy as np

import MelodieInfra.core as core


def new(a):
    return a


def iterator(a):
    return a


class GridItem(core.GridItem):
    def __repr__(self):
        return f"<{self.__class__.__name__} 'x': {self.x}, 'y': {self.y}>"


class GridAgent(core.GridAgent):
    def __repr__(self):
        return f"<{self.__class__.__name__} 'x': {self.x}, 'y': {self.y}>"


class Spot(core.Spot):
    def __repr__(self):
        return f"<{self.__class__.__name__} 'x': {self.x}, 'y': {self.y}, 'colormap': {self.colormap}, 'payload' : {self.__dict__}>"


class Grid(core.Grid):
    """
    Grid is a widely-used discrete space for ABM.
    Grid contains many `Spot`s, each `Spot` could contain several agents.
    """

    def to_2d_array(self, attr_name: str) -> "np.ndarray":
        """
        Collect attribute of each spot and write the attribute value into an 2d np.array.
        Notice:
        - The attribute to collect should be float/int/bool, not other types such as str.
        - If you would like to get an element from the returned array, please write like this:
         ```python
         arr = self.to_2d_array('some_attr')
         y = 10
         x = 5
         spot_at_x_5_y_10 = arr[y][x] # CORRECT. Get the some_attr value of spot at `x = 5, y = 10`
         spot_at_x_5_y_10 = arr[x][y] # INCORRECT. You will get the value of spot at `x = 10, y = 5`
         ```
        :param attr_name: the attribute name to collect for this model.
        :return:
        """
        return vectorize_2d(self._spots, attr_name)

    def get_roles(self):
        grid_roles = np.zeros((self._height * self._width, 4))
        for x in range(self._width):
            for y in range(self._height):
                spot = self.get_spot(x, y)
                # role = spot.role
                pos_1d = self._convert_to_1d(x, y)
                grid_roles[pos_1d, 0] = x
                grid_roles[pos_1d, 1] = y
                grid_roles[pos_1d, 2] = 0
                grid_roles[pos_1d, 3] = spot.role
        return grid_roles

    def get_colormap(self):
        """
        Get the role of each spot.

        :return: A tuple. The first item is a nested list for spot roles, and the second item is a dict for agent roles.
        """

        agents_series_data = {}
        for category in self._agent_ids.keys():
            agents_series_data[category] = []
        for x in range(self._width):
            for y in range(self._height):
                spot = self.get_spot(x, y)
                pos_1d = self._convert_to_1d(x, y)
                role_pos_list = self._roles_list[pos_1d]
                role_pos_list[0] = x
                role_pos_list[1] = y
                role_pos_list[2] = 0
                role_pos_list[3] = spot.colormap
                for agent_category, agent_id in self.get_spot_agents(spot):
                    series_data_one_category = agents_series_data[agent_category]
                    series_data_one_category.append({
                        'value': [x, y],
                        'id': agent_id,
                        'category': agent_category,
                    })

        return self._roles_list, agents_series_data

    def set_spot_property(self, attr_name: str, array_2d):
        """
        Set property from an 2d-numpy-array to each spot.

        """
        assert len(
            array_2d.shape) == 2, f"The spot property array should be 2-dimensional, but got shape: {array_2d.shape}"
        assert len(
            array_2d) == self._height, f"The rows of spot property matrix is {len(array_2d)} while the height of grid is {self._height}."
        assert len(
            array_2d[0]) == self._width, f"The columns of spot property matrix is {len(array_2d[0])} while the width of grid is {self._width}."
        for y, row in enumerate(array_2d):
            for x, value in enumerate(row):
                spot = self.get_spot(x, y)
                setattr(spot, attr_name, value)


__all__ = ['GridAgent', 'GridItem', 'Spot', 'Grid']

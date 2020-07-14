import request from '@/utils/request'

export function getList() {
  return request({
    url: '/api/role/pageList',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/api/role',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/api/role/add',
    method: 'post',
    data
  })
}

export function updateData(data) {
  return request({
    url: `/api/role/update`,
    method: 'post',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/api/role/delete?id=${id}`,
    method: 'get'
  })
}

export function changeStatus(data) {
  return request({
    url: `/api/role/change_status`,
    method: 'post',
    data
  })
}

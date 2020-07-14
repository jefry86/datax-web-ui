import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/permission/pageList',
    method: 'get',
    params
  })
}

export function getAll() {
  return request({
    url: '/api/permission/all',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/api/role',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/api/permission/add',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: `/api/permission/update`,
    method: 'put',
    data
  })
}

export function del(id) {
  return request({
    url: `/api/permission/del?id=${id}`,
    method: 'get'
  })
}

export function changeStatus(data) {
  return request({
    url: `/api/permission/change_status`,
    method: 'post',
    data
  })
}

export function findByPid(pid) {
  return request({
    url: `/api/permission/find-by-pid?pid=${pid}`,
    method: 'get',
  })

}

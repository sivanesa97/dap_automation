// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import ShieldOutline from 'mdi-material-ui/ShieldOutline'
import { AccountOutline } from 'mdi-material-ui'
import { DescriptionOutlined, PostAddRounded, ReportOutlined, UploadOutlined, VideoFile, VideoFileOutlined } from '@mui/icons-material'

const navigation = () => {
  return [
    {
      title: 'Home',
      icon: HomeOutline,
      path: '/home'
    },
    {
      title: 'Input Upload',
      icon: UploadOutlined,
      path:'/input/upload'
    },
    {
      title: 'Attributes Report',
      icon: DescriptionOutlined,
      path:'/input/report'
    },
    // {
    //   title: 'Masters',
    //   icon: PostAddRounded,
    //   children:[
    //     {
    //       title:'Role',
    //       path:'/hrms/roles'
    //     },
    //     {
    //       title:'Department',
    //       path:'/hrms/department'
    //     },
    //     {
    //       title:'Designation',
    //       path:'/hrms/designation'
    //     },
    //     {
    //       title:'Company',
    //       path:'/hrms/company/list'
    //     },
    //     {
    //       title:'Country',
    //       path:'/country/list'
    //     },
    //     {
    //       title:'State',
    //       path:'/country/state'
    //     },
    //     {
    //       title:'City',
    //       path:'/country/city'
    //     },
    //   ]
    // },
    // {
    //   title: 'User Management',
    //   icon: AccountOutline,
    //   path: '/employee/list'
    // },
    // {
    //   title: 'Resources',
    //   icon: VideoFileOutlined,
    //   path: '/faculty/resource'
    // },
    // {
    //   title: 'Access Control',
    //   icon: ShieldOutline,
    //   path: '/acl',
    //   action: 'read',
    //   subject: 'acl-page'
    // }
  ]
}

export default navigation

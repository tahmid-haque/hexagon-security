import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GridSortDirection } from '@mui/x-data-grid';
import { Note } from '../components/notes/NotesView';
import NoteController from '../controllers/NoteController';
import { Account } from '../store/slices/AccountSlice';
import * as CryptoWorker from '../workers/CryptoWorker';

const encryptedNotes: NoteDto[] = [
    {
        id: '0',
        lastModified: '2005-09-26T21:15:50.946Z',
        key: 'l1fMjOn8Ebowkmed88NFel0UZ+ItLngUethgAXMvA8T0mMk2rGmgKABlHrqlff0m+6G2pkB2ooo=',
        title: 'NU1YlwXYJze2aFCsGvSuifQCDS6b2qbCvSdnI9cDIy8uVp11fdgOUk8klpA/HjfN7KzVylD2oSb8pY0TzIMtgqdl8wVInu/Z5CZ3Uwy65TCgC+UOFm7fhfuvGI72kjJUuIko3Qx8ruRz',
        note: 'IP+22FgB2BLsVN28+jPNMuIeYPtWOn63KO55Yh7j8b3qUvrcJwnSm7HiEz+5jHUht3L9QHhXKLvtMpnihNrJq+iJehyVp4i42UQTJzNWXwcLicbyi4PBfJ29IV0W2ntm9u0cy0PKVjm6RImiGlQjusLx9PLKQ5N4hKAWW60N53FicrPHVaw3AHFOr17Awe1yKvOzn9OWSBFEXsaPROLB4/5VShZqYzcxk3H+rp6otV9n1ACgCLnIAnPiUO/gOlZ3ZCqBiOnuWX5HnMqC29ygqjJlLKUqoil83PEgwedfOg2GCZBdS9nTTf+2WvtboEPj+MMaGR48HpEGHwEUP+1wzAf1mrE+HgTS9xNdBt98rpMHjf6nLPA+zjRD3NqFTZ1+jbIW7JQNWMGnAVCR2O5GSDMebQODlV483MJtTwMfPbgsiJBZNHfompvak46r4dWvL8spYmE+u9q5',
        shares: ['B0P6kEQli5hJ5aEoAYqd63N8910bPMNKj+4HtPkQrrqD9AVKUyeeRUU='],
    },
    {
        id: '1',
        lastModified: '2002-09-29T17:43:20.024Z',
        key: 'D+Zn5pSK3KjlvlN5NHfiEayBrQsDVt/iqnx9pMdgFUX/OTTSWwwSkNxnWUxvUhNYb0w50n+paJs=',
        title: 'Q9VCiqkGBvOMGgedpPSRXgDF5Fd7iX4t0M1eWjwtRQLGdG4KUVI0cnkbX+h5B02CdMh1QusM1NWx54nBLfIyY3jPCLasWdk5smxsxSqCcQ8+qapSB89evUlx+CkyNI3MLQ==',
        note: 'fSxkNWkWAJ6cLwYi+9ubXbViZi3aYfLmrFyYGuQ5Ir+9zW8FMvuyqNlMleQgaDcG1mM+6TNZaIQpko04MBP34ByXBX/7Kn/gAD7xJJAfLdgVn05WkWohLytBoi3547ryG9Qp6cruX8IMX2liy9ZNZ0Ry+wCMNRhhtJNGZhp2Qd+FZC3VUv2M6CqZCw0OWryk4cgAwksQaW6xD5K9cWx2yvJ74yPJ/gLrRtaWq7vDWG0IWlNAtxLq+LmT5CWHi5pVKDooYOHcMjkdt7F1bFKTxt9pf22ED/2LnA0rZdbELwafvWwh8D2anOVq/VCA8lh9jlcjpQTOawxoKaZcGVs6dfO7Ule5jhnEMaocFkVLxOk+0ZWqOaKa5gIZnYtqtZ/kLJH0WkEb0qupMHtE8tisW1le4/BSv6J/E1Y9knRcpc7c9G+ndniwhw8lzy3FvJOokbxefWbIPKNE7HdA8Q+RwE9J',
        shares: ['wmCxSXrQ8EugZC39QfrBER11Cr4euP/Z+tZJcHlzKWBfbyzBYEGsbz4='],
    },
    {
        id: '2',
        lastModified: '2005-08-07T13:01:58.533Z',
        key: 'nco8tRc6ZcjlClrBIkVhcgr3ndj0ZtTCPMIgM7i1flgVFAIrXgZ6SXL2unwiogYRftJ/n6HMZ1o=',
        title: 'Jl8tBx6DQtJH3XreTxz4RRO3qyqHFO7amq7tkqU3m5aZakYoaO91Fb9f8M/eXQgb4WVS2io/nCzQzw9DcZ740Dwh5gV+U/y8i3xaiEoBPZuYv8D8f1s9qIt5Bck4ZUEPd3yHWo4m',
        note: 'zcVhevZ0BYMmc/khCq9JYdeZs4QA94sX+E8zcqG8jxfyWomeBDutQ4w7GkhUbrHWzY6EM6SNPw8kO251NE42wxn3bfDSRe0oxdio6pgLF2OXLhOPbN1p5bqfnw7ztJ7P+ebQFPs5gQhQzL1Dbkoho0NzqKjjkudUZbxG8a+Rn8/PWS9DWxjoKQipGeMpyGZnoNDi3b71O6NV/nBSymAQNy9JtSHuMb15UbyCu+MoYN1Qs7vxrziTbLEm0BtUTY/aljye4QunW99ho9EWLZlMXKi58ioGFZBCNCvwX+GYe993QOGYe//FTxJPpFx21HF5AMwC/3xM7Jt33qXpTV8RMs0UpS7wSXzRdtstMaoqye85RfsPwBU9vbenoQgYAtoNYRtJOLfUNSgsMOe6baJoNMoWoR9xnho/AKGzOYiOxev7YSj3vMoj6e94Gsq+wW/IqsDGwhLjcbBRrJn7s4oulaofLGVvVBIa5o4JikJYWAVnHSfqYGy4zA==',
        shares: ['RJjcEnLN2F2Uh0nBU6md6LOLdnyknW8rVjhYtrUPCmKOTJgxrLuk6/o='],
    },
    {
        id: '3',
        lastModified: '2006-12-01T01:33:54.759Z',
        key: 'xHUP5wEm0hcnFpCyUacd5wqvaOAFRWb9fDx2rQQLZeDv6ZWFm6z4qi4/tAB8xm+aQvYT6E4DP1s=',
        title: 'H3edqk0HN7Vbnio2BjoywhQTpIpTqTzkkmuNDfj8rTxm+YqvasfD1HX8tF0bxL7FT62K+82/rjtOs7wK+0MjemPcCvWkal7Avo9vKUsyTdup/d5D0fE9XGV5Fu6K8ePALoQ=',
        note: 'rstOkFjPaJ6yw5foxlrNvn/023XjI3+EZb3VKkSMUs83EH3f6EkqLCVCMQbWUZHLTaM2pncPFusXrF+pSUSlhOyP7k2KCOABd7cwPPrFzHRkLi4zcacDjrQQY6YdSs8SaO5vIVRfd7BpC+zdwTJ9GhXsJRB+fBG97HH+fmlO9jVhPVCPAFaBfArEqKpfW0ouqSiPhdvDH5607g0yXYNPYbt1hXiFV6P5z7FOC3ak6bir/P8yz3kuqDDFMLivctQUEFDS4BwRcXdwsHjhAifk5tP6U5tQ+yLta3uMptZRBwj2Cb1Gf/n3YAanICCG41VgbqCf9ehkdj+SUd2a1SJDuIqdFrYyeiJKmbW4X2Tjg4As7AguThMgUNpb0Wt+LpS+9b27ne0FeZLa37IJ9UuwcWvHQkc2f6aM7ImTuRjnyS5KbuDqvpF9mTZ+gR6pStLZHzeTbuBBH35rfitSMrT8zOwrLxkjDiqvQQ9sJl4E7DPrMDgaCNcC',
        shares: ['9kF84j3Pl+nHhhmswXwlVD/IbF+ymWgVZklosK7FeW/+nyOz57HsFDg='],
    },
    {
        id: '4',
        lastModified: '2002-06-03T12:46:09.810Z',
        key: 'jGzl1GKpsp5sr/wMBe8lLQJK9nxNOY8u4SxwTrpWATWmLPIWrDCe69PPK+QRJQOQb0lqFUBTMa4=',
        title: 'uTrgSePEcdBkir3B1eDCoT6T6+/ZuPVzDxAJ66roCoTa/PW6qTdPfLwNiLVjzv9RJLCidjIM3KrSNa4PsRbDcTODbsj5/dRC91yy+uta+u1SKZOZYcJcwsUpBskk',
        note: 'QqBHOvRH2uienx6hiBboQiHto+legYZ+Hpt8xBRPPzZwWbOT9N+oNhhybp3TfJxUBz88ftEIiRYXPxSg2DkIRJm+zJ2XLFYyKup/kn2Z0DE7keGrNvPlGEzcfVAQ/k4kae5zqeTy+bs2X+NBKZqCbYKu0EhnnrvBOciWJm7dysfbp7XwAFrxov7qc8xknk2Nxyk3jpXtprLazpiyVlawBX73GPfV7+w1mYpG/Y5TYXEK5hGOPF0n5MWhz7pHE8zi9itciKyiqYjP5T/C3Zq67jZHi1KbpStPm4bauYhI/+rvXBfVHJNoIvt5VAHfQwGo/Gf/L/jQQvp5XzWCPyUdfVOSTo4B1/Z95zsqE3vMzU2N/W+h9nZYnfE9DWPng92FMPY4qDMDrBZre5IH0+PlLjaGVbIvDYuJeRGKomc2NRjJlrUxNHyEizmCJhoLKhs5QB6bk9/D73zW4k9Z4lBleHW7C+3KqB0v08SFO8w=',
        shares: ['B1/SdSa2Y3VpNB3uSSVuftLZCp0PmUVcGpBtdpJgjTRlc8IlWvOxUTA='],
    },
    {
        id: '5',
        lastModified: '2005-04-13T23:30:08.815Z',
        key: 'JWc7XtxFwM4QoEQLRvN0To4SWvSC475IZdKI8tPrqvI1mBExurkeAO/Z5AG5PCr36SR4ezne59k=',
        title: 'clPf5MXGkaPJKtrl/v2bA6Kb1tWjW8dqEX0+MaeRwSoYCoGtr1HAtjop2Y39NC8gkBrC9VVlKmYhmSHU0+ybqf9/IJsrVwlnwcPDYLoKSGSUCt6VNt+3MIDKHJQ=',
        note: 'l4fjJYafeQAfNVTPc5OddIYeghYN2y1D8sVBY1QAqrbJpRr86lmga0VtMmQf6uXrhJ6Tz+zcpUsRjsLZSxHi/EqvoGcATet+JanbUGycWRtQhZB95CaPg3aTAhqEBgZbctGy7XUVk/qtaWYvfEHy7wfpmkDiCiURaAvi6XwEFAj/bSLtnat+7OMl4gQk8HCgFxPGe/DkWsLyyAoqRSD67fljyn9s/gSLxIjplBpdcBIcn0CbrnIt+SLZ1dhrLyYgJhDgWXQRPfOTwFIrLd7iS9z/+C1P5ljFGtjIyIonCJUhger16UuW9dPxMntMFsjjw2Z1C2t6l4J+E+zK3cqFkvNs0qB1Cl1UIzEwwd5+gPRxCPSTgFoQX60tC0DJU0cLhjbyK+nLN8QEABvRPek9ZlZHu18frYDYK15efQJAzBMcZS7fA94SSo0u89RdLKZ8kTE91qTT1NsNQ1u9F1dV1bzCpz9NSnzOFSTkSdSBSxY=',
        shares: ['IYfjMhBd6KNEvyK6SuMRMjU5JZMmodDbPkE93YTiZneWYPWMUf9nGMs='],
    },
    {
        id: '6',
        lastModified: '2006-03-23T07:31:02.146Z',
        key: 'nmrnIu/pdmjbYovP0GKFruHtYHU8Tqveri+SyvBZX5BMWUBFZQCJo0JXpt01clnw2Ke7ntEY4Dg=',
        title: 'zAiINLk/coarcXSWomvvLI5aiaaeuIxM74lnSJz+03tgRcXbl0R64HZdSKoCVoOagKE1Jx9oYDSpeTTXORINuoEnwLZb40oTxKsdvwRohbxr7dRcI11TFTDytc71QtXALg==',
        note: 'T0cUNTm88EW8CEpL1TyvLCV72MdvFeAIws3SXzXEQhvIwmB6ezSsen81jFizUOPctpb5ukwdKQy6TrUPleXMiftXo70LuZu7QOlOzdSt+KEu+2a3ho7Ac5jTsybwJWp8NUrOSDIxkpAGq2zH1vOZ/76oxkzwAE2t6vwDGJYa6OVji3yD0vbZTtW2SBXKP40xpCz3XFCT8Yh8FTsmE0fpfUZYZyfrY6FskYFVDCDwXsGKmatCpe+2J5TuUc5HEdxE9iQQTm77Ni1g9SYVfi28YTxb55tzyuOdTGXGycS+q10kX4JTv+REwsixEyIxE7maNHerVDcU82tPZHAl3izQxJtEbgoimcYBvs3vwMA760xgdh+FyuoNoNtuCdrwESAC/x6LR/RaE3RMKKEuI7om983SEt4XmYH5wof+DP+v9TRq5khmjS4Iiztgdj8HJxZLz0Y1yTncMvyH5KYiwNIToWjrBLxlTyPF22v3lZwpTjxh1Q==',
        shares: ['OC8P1ET+1QHTc+vlsqfwvhcA0Fx23Xk8y8AZFPlEas2QsJWq8Ws/mBc='],
    },
    {
        id: '7',
        lastModified: '2006-03-21T00:08:21.743Z',
        key: 'BWZe+ZqHwc5y0hONGgSGhNNMhpVW8CKyRzoVGJTtCsCnuk2POUY/7EUYKcwMTY5iqqtCVZbOs0o=',
        title: 'Epv7ot4L1zjzNRa9pcYjplVclQiFaCnaTVzr9LSnL488fDR3xsvCKyOk29dy+NHuFLhfMn1sLZS3dOjGMl6AZw/s03kTKO2pJ9+yoTpkZEivN8xIIOu3JH2gPQ==',
        note: 'MgnqR8ISrXIFyQpma/UPEoR0At2/0NIQRHNZKA/ZQvSW+ybOacmhXNUOxRncipPlUfHGgxIyuq4vE2ZrNAUG2YPu5ucxTUTyFn1PmnP95Mt2d5yeOB70l3WZo9lZYGV4pHFp8zQiaXaTsScx3TrxPHjkS0BgXhQO8Zhu60GLBHtFPvT4h070JZpit8VpYskUHD4DM4Y/Jvgp/0WWQwaag4NZ/aRmtEffbQXJVFqfSWlGZoHOO5Pg7HCJaqDLjhwEAbFUn9pkQEav5KTPd/rXz5yuHzyuUJPCAVhr2plRXN2mBMjLwFxJy0MJTOgLOYHki7zcrOGY/sLA8m4MyaxmAbBySZxGcmRZTibNC6OuSDw7BVrGntY2QAO0TMhM8Kv84EZcXe4ZdlJGL2DkrHUZ+GVl/0q8cZwqeibxBKigOY0SdfOHbdarYkCgi+jGxpp7VGGCQGQQPu3RB2ZbmXGHkQ==',
        shares: ['QJNoxRH+8AMvTbCi3utzEqeSdovqcpHi3v4ElsYiT3sruqAIBQUQxKA='],
    },
    {
        id: '8',
        lastModified: '2008-06-12T01:26:34.201Z',
        key: '1g1aBzRLwVR2hVBruerCWeetr002t8X91R6LkNWZe0GuSz0GwULKAUxocmhzJicwbGRGQz7juuM=',
        title: 'G/81IO+8dfoG+z5f7qkGzGNPQCjIatjk8uVd3kRxAov78FLJ5V0ubkSQZeqUgK91ynZ1JxNK31xopWumPuYR2P9i9Vrtmp2LQvQbIF72Zul62I/JLQ==',
        note: 'wUPiDtC3OodN9El3mH4IvvQeMpVlnnWB0h4xqwRP7pnJ7PSmS6emdwck8qzSM1uoltY3w5uJOU39F/4Bhl/LR932ErxAaptGu72/oslkQ82S8/sOL3/wBeEdzUvGhCX3cCrlaoRQBCDEzgey2aXwoTqryysFL3thv/8izMNFot/44HOS7gYirv+IOmwZGLjkl1Mjltr2fUReZ0XwByJOuuZvS1QUOi/yU0MMaSulltkVSleiqFCNmgF3I2ybHBZj3g5YFnnxa0JqsNv2IymaY4xDnkSP8tdEK0b16GZGhCXlLmTISbpvE4W4zrYcCSXVmeKe+ZOMuvQi3Y5LU0g4BEFgErPWsNHfYb3Q7ifeQQw/ke9MpY4TN4pTQskIjeEcGCK+T1xr0o+kUB6RBi/TZJRvchKIdy961JJzqtBr1NSD7gxZVUk/IhkAdTUwWkz42OFxj9ACb4NiC9dh4/0w',
        shares: ['Abkecmyu5gvdij6Dk2QCcYsjeniMOk291/9qa4DjGbjaBlHA737eF/g='],
    },
    {
        id: '9',
        lastModified: '2006-11-08T05:21:03.915Z',
        key: '4lbkxRdH7UF3PXGxZU+CtgE90kEIhbhvuY5MPmD8DaqGipaaFmU/fs/Ukk1NzSS1JLY0vKkHGGQ=',
        title: 'dVl/DLYvDrKtIa4RE4D5Mr9tQeXWT+SGYSsoL7/nt8oB5gwp/4nvN7pWbQ91ZLIuU8+1NSrE3O8xRtjWrgnmz/4C9Xn9pjuMNkVamrlhnq4KFIMbqWi992v5EKpQ+xc=',
        note: 'IjMiGG1R3DcmMAfq6ACKlt/oCy1mH9ezxsWdszh/wwkBwVVcBRBfcX3+REjGhZBG0Y7NAQrI7B2yGJxXxCrG966aJZqK/Nzuree817EWFNsLZsLPnRnywD/JZN31h+F5kN3n1Lg95aXjwHi1uG+cZkEFDtApJ/LUF0LVoUG3fGAdzIg8SZ+tWWYPZFFUviaiP7veBhzsccCeuhi22Y3/DO/PDhb3i4eKBDSpTAjCXeETFs4+LRJRll6QRlEVCSUYv+H2bweUDlRJ65d7UMwnfkowstOvbdQLD5IJSzMKVo14R+aGOhLwRFaNshIM2hGnD3HAfbHoWaPRUMOzOeiJofvrsJmRLkoTQwxLln3t+Cu/M/LMNiIdt4/cu+snMksCKqStxG65SFlvoZ5+Txo0tr13AM4QHLhmLteBUcocA6IghcWXNw6Uuh2LDy45gwZMn2/ew6OruImnWZc18XqYxlLL',
        shares: ['cWi7DeXxuAEbdlB8yaOpcLHn3qPHgcku0TBwVev6PM/yCSA8FeK2Kpk='],
    },
    {
        id: '10',
        lastModified: '2008-04-20T23:53:08.026Z',
        key: '+QAeym6AZ0x6G4miOSlQyz0EsQ/dmXeP5ZUvP1iOayRwuG/FdicUPAfY7Hm77QgEZVQluoXxGJE=',
        title: 'WOby16UalxXThb2WbbI6ECV0e3OMdDXgRVUYgXCLj14aIrC2eZKgPVe1yAzfPeTcpJbcCLiO1CZZcrWZJO3NncqBwAxqIcBKvZWFeYSTCS3Z7MDbzNz8roLg2kUmyw==',
        note: 'uMrBJjzl0GKbff+xPrnYxKPlpMRwV/X+xMn+PniMvajl8HA6+JKuK//+WnOqogabw2/59oTdlfAyUcAU4LkjvV7HvWlB9LqbcZz1RH6zpIWsh2y/1ppUhOwYMVnmG3k0dn/4aaZCUoOxiALukFaaEICkjk0EUu8OWh5x2fP2CHLvJxSDUBV/ddTRac0GjbSC0NrGNUG+QXwrL85xIfq7A2KVEAjITfEywDuqOkes1snHEBfNWdzs+E+wFGQ+F1tjCKnjEDNFzycslnmO5hIVs0oX//qesXr7q+9HICO1T4qe99FqJrvvYLlaeUPVCxU+za8FiQq4bxYer6sRcU06nVexSheihWMhEvTTf0PvDl2ChaMo6NOQ8ff3vfK4fv2WwwDN1MVmq4Pd2xRipsrj9N1C+AKvgUap+O+9/p8CElKhEGZ24Bssfk1l09U9KQpSe62ayhcK4vJQka6GvrMDQqjZTxBK',
        shares: ['fTM1DOzAhrZ1HgwTyVGuex24v13mb/26UzuAPgDOgg5WbOx6c2VFHQo='],
    },
    {
        id: '11',
        lastModified: '2003-09-05T06:21:24.335Z',
        key: 'ql6Vea5Xc3Bim3aLeyhJaPgjw3wq+9bt+5V8K/IPJjDSR06H/G661xC09HkgikFoq1lesLFqN+Y=',
        title: 'xDX7kaCi3kJcux9lLQciS6Y8P0E7FKFw9LBhhN4RFfp2mS6qfqYLt5qbtHUTnSUHzC3F3RhJbAhCgtDrtPsiuHFd6JGVsM6L/DSaDn7q9bEpfeMiFZH3o3Lj',
        note: 'SpLuEalXj3DnclsprDCszy3Op7ceZGcuuCGAzbHP2+7h9AwotasKmi/yiDQuvMzAVxwXsmDpdPMs19UpanNclGmmUCAklqFc3aUqFTQXxWo00hIpmhxqzuB+b533kWYUX0uXKOI1OAxLiSrqp/x3hFCi7Kgbya3J4Vb290UXJkYuLuTP+AQtJdfcCY4X087i6I9G/Gb8VKgtLgbZ9YzsFR60cBNmZT5UV4LB7ebM1SV/BblTgqkFGePIGqdAvvnBRrS4HqqkmVdlUFL+8z7TZebCLfn1UQ6bqYHJEGTkLxUUl6Ootibm+UdBMBWq3O3epmnbR15Xl6DCeKfZj4igbyeck62FeNRqV2zD2f2G07rxdLGThMrLUozbLURAqq2laA8k+NkpKBG4gOHWuAeOV3FtMJFl9dGZksEiJKK7peX6tN+zOAUScNO4tgivAM74Yfmp5dIMB6R0iS/l6W0=',
        shares: ['kDpdvWpi3GWalS33GLUa+gRLFB07bibo423bTidwqwvrAucAtO8UCo0='],
    },
    {
        id: '12',
        lastModified: '2010-02-03T04:06:30.553Z',
        key: 'MmrFbot6T1yXaPYgqpl1pMhyfQOBVGdzFAslZ/0qV99Xo7mQMJd+oUETedsR4nQWL64CJTveJmE=',
        title: 'pbjQ3IiSDvnTxx8gX2FRh28RI27c8FlcenxUmJEQVXjT9QLK+zaiUUabFdgtiSiAtQeXg3bB9GnQ9pQ+nj6Fva8y8iKdShg+3k6xDo8jLi+0rE/Kk52o1g4Aq5Y=',
        note: 'g9rafTtrs2GWSNVDR9883RnLgQ0ypFaFSk7lVHrBcjvETXk8EoTmuOth3wYiWiQVsvxDqzT6Hfw1uLVi7xTNJN6tRe+DcxxG8nbjsV8o3titDTQuFCROQpzEHPp0uR3frbRFRQfkGKgZ7gYJoBi3HKiw7waIumJ79pdsJVyhupX3ZAm6RCY2TNKFwgT/rpQT4+EuBgBuzmI+naGKuIZhcpHTmS5VP85VTxXi1KSy8h9emIZnDdjhFakLq7BMw1eCP9+j8ARY7xyZ2b3K09bT7bXP7+FpQZwrMcWsWwjKGS+TSrkTLKEvjUOlw6Wu1g8ZfHhlqpg6fguy565OPxgjtgPgIBc176h+jrga5BC1CIihMcL3nUj7pE0oPh41iSpgYa2lff8WKnTqiHs1iTnYtfZVwYWQiDxmb+eVaF2OCsovYm/Fp9lKh7JI++/9ceeb5u+kbgPfe4+B9X8H53pBNLMMvrJWKNuAuyvuH1AjGA==',
        shares: ['km24YYlAIRWdT8QYoAL2MPwOUSeU7XCqeZix+yYdoj1R8AI+96csC1o='],
    },
    {
        id: '13',
        lastModified: '2007-12-24T19:39:59.951Z',
        key: 'xVgbQBAWSuC8A+xQVr/hJ1STGj2QlQ6C5PF+CYhHOpcyWD5r03lNQZOoEN+G4FACjRgbB7E9nL0=',
        title: 'jGers6pd4wZfaq55kTzPrEWJuQ68NWI4TUox5LQuYXEMXGhUVYz2wU74XBsOV7fi3ER/NP2Ik/ADIeTF+7Y2PqwyDmna32+VwnSiQM1qap+PSAC6gfu5Mnz7D8Ey',
        note: 'VLReBD0ev+M1VAjQGCPpKzNQwqSlkRnxKqBOPIFsPciiTjd0Y6zI195KYuIxg20vO1G3cLCrHAPS32Ch//rJrEhMWk9x+mjq2YrpLYok8fdE+JlHDYQQmrVVNoS7WPosJuQH1gJVdKTWsGjAc4XaJ/E4e0iaZ7Sdfb+TeVZuntPCwNjDOYmgvVF4gwRrLIi0BoAOrOf0uXE3yBGJ1x8ACpJvmEuRne7usc+vsweqacnEBMU3TC7TSqCgX0VgCHLba8NiDJ2V6xQHJ4r2XakE63M1t1U6RYu/DNvKmBhkvMQRhTAaK7T0OfZHEFB1Ui7A8mDuT5OtZIi9KdWd05/cdoACGbjtgS4dkiH01Sei+HCIoVqiGJVrks7L7al038S/sY8TG7OL18yjZC4hUDGLtUDCfSU8qc7PULNP/s+mmcsJHZExKZ7weqBDGU+VS+P+LDJZaSCi2AZMAX041W2BYTbqzdyHlUg55To=',
        shares: ['TejCT9FG6AG5DAs0i44CiH19EB4aKsbw1r91CNpLivojQVDOkpyD4d8='],
    },
    {
        id: '14',
        lastModified: '2010-05-24T19:59:44.035Z',
        key: 'IB4UjK99rSdeY6m+1H0fpln9ArWMgsN5w060BQFvWV/iomAu1aTrZzYJrWtdUCzu8eGU5xHjqM8=',
        title: '/5r3+/Rn6ctjeIXi+ENxjcC01/JMxkJZcaCVwNZwTvY91TM8qMnZ6/B8bnf/MKGFZJFwSc+NLDMXiD3jPas8L+5tobJDMk87yUPL0gBzzdvM0iCSxKQficUJ',
        note: 'avBImbc4IXoipcSPV8eXqrWFMhOOsMWI5qkkmUX2wNOWKArGrcPiahkwZGsIRz6LTxKnN7dlLGhkOiSmRHCtLXB/+5UQ5kWTS6+MLPegcFMJ+piy7HMPLaT2+pGiwdOtyaMYGXq19tlieMmUaHdANgMlad0bdJNVlzZUZNFvu2acpTpPzn8POMX0wiA+bKbKl1eOtpYZ5iBF0aRy8UfKQqDou0SKc02ZaDe9cCVSTU53/npFHyaT2oJ/9Fz2/BXZbHorJ7hIOnBII3W8kOGOruXyjGi2PK3xLMdlafQc+yOGdWquZ4TMOKl4scPGpWl09iDRr5Ij+65oyyTBXniWl42PMlcKEU4mh8WbQ/HewJufBCU9SfKj/LiyjIUoYYPUgT4naB3UgHS+rIWE33avBY9SjnUYHiR7pCNeJ+GNDAOTogyAjWQJKpGuMUTHUvCu8XSurCGziGafsz2mR9HWlnLzXA==',
        shares: ['XuEW48clpg1OoZaItvp7x4fkNY4loiucHNmZ0f2R1PpQYdAXlrPY01U='],
    },
    {
        id: '15',
        lastModified: '2005-09-29T02:55:57.904Z',
        key: 'JHP6G8Y5JiOPoqe9fNjgrHxwtmkTVHpWiOnDtDOWBHgFxB6ftWYzlGPVac0aceG7YYicwmiqBgQ=',
        title: 'mH6DgzWxs2PcMi5OZe2infXZq9bXwz/8tbKcLpYRSN1ZRNog3AGg/ZZfq/SQw3wxCPqLhtGCEobUyiPVefQz6L/zHdqKsEvbGQpNWqL9IIfgCh4KeTMVJlfTDQAPMP/z',
        note: '7Z/dVXRK3GFBO61SMmNoTbw/VkBm/lJodojKcGq0VdYuKGzX2T6yLxWBBnTQFfQVADEyWIHu0FHgY7eOx+FgHh/goGL7kBq2xCMnRCA+b/yC/iLcEyNKFqVpDHmVPVmp9fLrADo8q6uXtTG6FcfuluTDV737cVtpzeJf8BFvyg6KrMXNUEViRrN5Qn4nFg2RVuMMEsceUUePfM4yH8eBY3kCcvlwKrGLRTq3feN9b9pRhXs89p1q3Prsj9oIs2+SPGlrSgKhOQHbCSvzt4Mbf8a/QMKuib9F6wfNs1F71ohC9GOHpwr3oC7x2/BYB9ygXVAo5vwyQHQLMi5inbHgnsvfSLI/kszvwSvZsuvJ0fcHpRKxTgU1M/RCwFjjUoowavDzU2Jqvnwdtb/7ZH2CJlRX/TQmXQ33mXCrDUrzuR2tDU6OLQw8mFVydmytceALa1JcQ04ItSsvbKtpTgI9AVJhlAPi0s1Fxlouh5uJvtw=',
        shares: ['DUlOEtQ+eyWZiT99YP2ThDZffL9fdXof9j7+bGdTFelNa+e/9vsEnvk='],
    },
    {
        id: '16',
        lastModified: '2009-01-10T09:20:07.193Z',
        key: 'NexsARx3uTeH0HN1mggOevkfncByVfWlDwGTf8WQJE6UsiTBCp0uUYF7p7RNUOO9HNhzmZtKgNc=',
        title: '4vMCIpl8AO3sp8eJ64rH5/DfTfG0wdHKidjObbyGfoIvYGwHkN9BqbvmjvlHyJWw+dZkLUoe/+bRiOn5i+QqnvclfqpqpuZG5w11OZQapM+wqLcvfbrV6vPkmlsDZoXUkJR3/OcpcQ6MgVBJeYs=',
        note: 'uCX1rYDq78e2tVAYWLN7MPXz4vCcK6mhejmZnHL/IlQTIIHvajOG+leXxa35/I8MFI4gcIsKaoTUHAdEhjMkmwhvYKpfCuH9V83R02DBg4lGyvPJwuLr4KSYImdNDK+DOkEM5LiP+bYHckcGM4w8jWSa5R+yISACD4G0tPXyDvSlPHg9TmM4BSs6S20eoTm9K5XgFSD3Ib5sBm1hEpNVCLSsQMf6CfuUIAU+TVh+OQb3WySibgqHyznpJKConqIjLRkEKW5/e4+3dLn5srSHWafmJJL8KD3DdvY0Bt27v1zcrnwD6LVnzIGhzsldgOMfM31ZP9rjG+UyQqieY78AK217RyVExNwFSik9nIDZtcBaeIQ9aoxkTJaJ80TKwbLTnhqsbd64MchnNfGFjpIrJ09m+fVIFBuq8DhRjoHINHExlfvNsnfuIQcnuUXyoW/jenKIlqn26hIK35d/Nj1uMsj39McXr6iXu90bZiUKno6LD/oatPy1Lw==',
        shares: ['XU/gCFzc9/kR+FlUHO+5EG4Ut1AxcKhYXlyzLY8vANy4Ytow6DCnNno='],
    },
    {
        id: '17',
        lastModified: '2005-10-29T21:46:23.703Z',
        key: 'k0PxgWUljV/1GERmv3BJW+oOkv1xDQfgfMfDWRXvnZp/enLCWaePNZIVNT3MUlCWhVHD5HMgv+0=',
        title: 'YfRicZWCE4bPTA0wwppEoCWBKml9ke3QkkmE3oXcbK7PEFfs6xwQk4k3ihN1qmEOALdMZGoeMeheQMlApxmzbQe4DTAMJyXsh+6/Mw8c5ujpD9uR5TwSnkE3zAQ=',
        note: 'HiM85qYhYt0VY5KGErTPHA8KK3HxDu5q4TFXBluIQKux+fxnCXLctz6jrbcreNT8WJOdn59AmMFFlCijU1gb0lEkZdOH+4DzAyg3OLbTPZeLaJk1DAWozP1FdIywJuBfvZCIMkQR0EnyNPxZ9hdi3NhpEjtx1oK89K4woKsCYR32XTP8Q81Ah5iw5z+8LMRoKMlH6MpDesoehMXi6kkf0wy9lfaMSWKjGKdcwAUKmd1rQBu/xv8knyZzTjVCFQCgIhcqERlt1B0IgIpVGXsex+2N4vC7ZqlavGa2j+YEGpAxjg/nBuy5azJr/sKkEjCpdHbPGFSLr4NxscwwUwd05GEC9EGH2igmog6LHwC0nciQvwKJ+sVYy0A2ozGuM8GtK+TVhbtOME93eQRkBLnkSmIHSxXZ25SvjuJKgAbZDtBqBVMEdx40NTcyKAgrjyVdkpAC2bRATnt0lshTBNLL2LmvLzhtzprQ9CSTM2v7+6kpvCfd5Y8h1EpoxlLbSUo=',
        shares: ['n6pf0ORFXYw0ZHmw/GXbO7HyCIS62Jb93LAHcLkEbUr483fjsoWAyq0='],
    },
    {
        id: '18',
        lastModified: '2010-03-29T16:36:22.294Z',
        key: 'M9VdNvBgz+B/INnD5y1mLQZnLy0MHNK8Dmv2aHvyXEVRwtSEm+VdQoNfp0he6LieIijLrW475Sk=',
        title: '7+9U9BCn4pn7kuJxG3rlwY8Y1JYUUb1Tkk5X0qNJMhluGSScLL2Ny2H//0hGU4I1p7at4l+dWH33vREGH1j8oZitWAPXKKV+KDOF0K95URX4UKFU0EV5k9lRdhF/IgyKO3Zv',
        note: 'H1HNMlhjfdc77dkH6j2QeNgeKgRoEQmY3bgHz3/iQ08g5N3VHvZncQei+5m0gO30jckNCmBj7ZVHp/MSrqiLD48eOhL0hODdkBNuGpVxOGFHe4ACHrJPPX1qNQg0/JJS1xzK16wWmPymcD3Zy7grVyAh1YecG076R0I2WH+2LqrX9Zi2LcTU8dbF8pKkxJtn0pNWSNHjl3Xi1XzbSMAxCRedPoaIc9K7fQJRpKlmg+qtbGR/n/I5h7bJqAfWR2X4VS+VdUgeOalc8osMKIcgDI3CSYDSuL6fdg+WkOaaQehKHIRKE1jWGHiYDXDVc0WE/ImwmU7adQw5K1IE79R65LE3olbKelpnm/wckc9ZTxK6cV30mu/+B8zGSdRTIrpRMmn2c8Lj+58K1/VT09z7J54RCmZkRoBO1wjB4xvo+j0lW3WaVCuk6lAci7ckchmf/hWHgwnAYeKYUXs0EOSyCK5HGnIUO5ezAHDTy0OvVJtkVjmqn4rnNMYZ',
        shares: ['s/2i22z9EYj9rdquHCD68BGXzgwzFat0T2Z/Gbgm7EOEGatD0IUJueM='],
    },
    {
        id: '19',
        lastModified: '2009-05-30T12:07:10.095Z',
        key: 'UkrX5jllS9ycX3Xkaq6EJCGNgHLOkWeui+t4Gnn8fhB3k/YhFGFllxeS6OItaCPCIwRd4TlwvjU=',
        title: 'YCntYRHqOezBxxKWwHcMOWbQGsKFcC77dGNuFbVz/dW1E+Mj78W0O7gnOH//Bph8WmzP2J9kN30z+e0BjvwPQPBD/zgkxvctGDo1fLY68gXfAv9RHdbYjZg8OlmHSSJ6',
        note: '8nvRCBA2ZXDTe6ypdhOnzOfdARS7gc4tJ2xUhJd7jFKzGjYrRRH6S7EhyfuVERphMJVsAzJ89ky0UT/DeqSXt/CKxOosFTYAxNnQxfKfUSyUhplHDdjgTz5u0uKcGUIF/A8ZbTSQJ3tDwBRZIM6wNI3TEKtEGdys2XJvLM6ZWCd86gxwDzoIG+uLz0+PpPIpe4KuvXATWHCvDRNgxBecU4RZqk/WFKOvhXU//hizSsB9cTPrxuUnIVkER0vqBSJcsJktGalVpu3LrL48AUMysSwEHHWc0f/HeCOW7vUopAOFYRklALJkYoziaKyhS4l1x79ZIR35i70dl2z/r7S44pCydR5rN8bfZssVHVw7cBGx1/s19Tw/8rj0ZjZ3W/oSX+8f64AAB+x3QGWRSfqBoOqNkjBhXbvJgScaEcOblGQ8bISRbXJjboVRrWWkbzXMh7E8DfhVEmc//uuDoVyv43pqGKnad2nm4yQvNQ==',
        shares: ['qoELHLGXbM6sogjavA6idRGqcggRf+j+yFl44tIp0u1fLdyCMkaAg5g='],
    },
    {
        id: '20',
        lastModified: '2010-02-14T08:16:00.606Z',
        key: 'Tszk/2DyyvafqL3aL5o5lq2lCXUoFoGN3KPePVnDJHXuvLzNyL1JLpjSfDmJERYC8OL4aeAVdp4=',
        title: '+JJCgRp/KyrPUd2KwBeFrUjt69/5YfRYQIhtpu9hM8R58dBRQ5oAr5OgFYTCAATFk1T8PIfZIYIN/fmcuuYG6/2kObZFtojXfruiJge4CV3+1BKm01q8hSI=',
        note: 'oz4a9oZ8PuC8Xd1m1BwNA0nr9jgxtoH4P++1Cz/aWbU+u0PPBpBA6nad/Q4mLb2h3SLTTcQUTyCp7sNCx9EHmtjfcFEbutpRbuQukkm+T4TNRgLIVBVnFWb1WI/1ixTzZt6mtFxpzgEaTfdEl0DpbJIlvPZn/ddilhZwIBT0U89TwOBDAQiy23Ot3FVCuVec9rRuZxSJYFZr0SiUDv/9ZvT7XYZpVFbJKERtszPrOEIFCp9ESBGzXchzZlaNGNpnnb/Xgoc8NG4rnCZ5mHYvEXTJZd+54dR0xm2gjoh7LSHyQyVtrJD34v2axYa62YZhMoIFzyfpWOOHyu9v9v0lxJ+3BbKilFq2AmZdiTH5jX4QPSCvVmd6ITU+5hYzthfWxj9HdFWMhfk+a3bIw+uB2dZmeaDu3pL8aOz4UHwg1aOzyWE2Rh6JtkC0P2qCT0Ei154RO+Gn79lMVbqGu7YZ01hJH2M=',
        shares: ['Er7+BgcQV1e6O0zXVdafZWlIr/FdmyipQa+3lFJr3ddtR3RuBnRBJLE='],
    },
    {
        id: '21',
        lastModified: '2008-08-04T01:42:21.585Z',
        key: 'ljJVmDoNa+iU+Ck5gLNvktie/tOUlt3QtxS8NIvI2d+qkEBTxnANNyVV06GWzBmV5bPrYw0GDzw=',
        title: 'w3QAx3tLIumC47OQVNmvGz/7biYcYeNjvMEhb1sAC4ktEbWna1s43K/E/S99x6F418poPGkbQQC6OHcAplHuMhPNMxmSeV19LA4ad/iF1/w5',
        note: 'ghFsXdLTBCjaeluYshNLw9nichb5og4ZbLJquWlNqMURrVDxkSzShJFta0/YK62Rg4WDu9auTturcoFoDyjnPnmd9G5HNUH3qSFmbj31rQugYjKgYWuM7nK4MOPCFA6B6zcDFUvVCZMq6aCb6WmJrUTeUHHolmu6m3PCntiwSSYcPSJEYI1pSE/rw60FtkOWg+mFVihxUqBaJMKJkNnxyxbh7ctSHL6IQwJ22j18Ge5apUl2zixjjGt7OZSl/Kv4J8QunRsBWg1iu5Bc9Jw9hMDCUIh67jNTys2AO1Gc9GHKNShqNrgfA4qqpbSXCj9Tl3X1Q2AUvxo5ErHRv0/AYgUc4SsT3wWeiVI83pADtsOaWp4vNMDc2QPGrEEr2wL2BZIElSg7JCx/gM20fAEzthWqQ03WK+lXbF+AldTDU277Kvv9Eu6XeU2qR+dTwTEfgGu/Ri8L6QSMgSjnYcKDZIs=',
        shares: ['p1VSc8+34P0nUlFcT+a9TbF+DEZmh008L/W5RflFTo7jizSwt4rFfHQ='],
    },
    {
        id: '22',
        lastModified: '2004-12-05T19:42:59.972Z',
        key: 'gldA+23c+XCE91e/6zu7k+Bs4PIILRz2FnivKKWFai1ABMlaTuMaBUFlKTXVg7s/Fh9SETOh0bY=',
        title: 'SrRmbTJD2W+Qj8Pactqobqte5z1ND7zV+o59wPyKifzj/vhoR7FrsHfwwaQTgIk66rVQ1dGJuseumz/FLwb6f9EWpGiODj+P28tOsPcNrdp7FLjF',
        note: 'qq/UTdhJf9tI8Z33MlGofgM4u6jJ46Lrqj4/xfsOGsY3sYrHwVxXs+VLkDtJ3UPoMiq5gDjqcNk3UR9l2OgI6Hqd7/ZacOlINL/N9V0AuA6BKllqO0LenAgwmdu+t/wja2kQSu5JH1/W4Jk10CTxdnd7as9YLV2SD3zfpjROQBY/gDZqd8qkZLqu5CbtL1ltOWIOqhP2KqW7tdWxfMsoiU8qMWl6AAMsSxyN5sBOfGGeYgI1R/mxSFlKXG8jg0Q4ZliPUJgDADempsy05BFcrIBf/4zAmnciV5x4w9mg90Tdwst6AE1pj0YppZeY3LgTNDlnpfe3dHm69td1Xp8kmhsPFCmTxZK47mk/Cod1mkbkFUw88j9CRBva9OoWAOHRTgMlCg+gSpTGVaV/bm4EsogQDFuiXmI3iJJACyIDdUrC9GEpmSUu93T8qS844BKU/1lYhlVpp9kyU8xx4kQ=',
        shares: ['9VrkgvHbhObiAQULzR5qaDUPZUnX3nU0Kap3VSKaVgOJfOs3NKMmGAk='],
    },
    {
        id: '23',
        lastModified: '2004-06-22T19:35:47.703Z',
        key: '3JyH4FzomUOYOwtDWMdFo5XfzOv4iXO3AZMkt8XmA6fEl64OBBLfvIGUJCFxTijky87oVmUoBj0=',
        title: 'XQPfjezhydKQ2SteMC+P9EjGvlMkPOleNLPHuuWbtNvI0UyayEPqyI+MV2rYxEyMWbwKdZAn32vcIma2P9ii758y+zvaNNQaOP3w1oMOaP3L2ygL+BiC/hNO0LRp8lzg3sDELg==',
        note: 'uIcQt8K3r1lhbbJP4wotCAp8TBMOvDPBNBbCt+9zsa+Zqf/BMUKxg6DKSEUl7eG0pXv359BoMgoYdZwfcI7quDyTQfqV6+zgb5cliU9N5uGuVCLQhSkFgN6JNduTFRclto+vJ/SjfbCPC/LfefSV0m3ajQ/yXKjKDDbV2Mp21zkkGi+zmsPzEi8/q2dVY/j1gcIzl0kvWS8SCDLTqHRnW9/x7ab2UmySKnejug8J6DR99741adRtEDWTdrAhn+DQj0Z5DEYrSNJaXGKI+Oz3zkFyT81d7z7knFDs7DpSgTDmbuTVL8mcr4IuILSqhe8yClvgVo6AI7PUMi+HSS0x5zZutrRHgdIRXvBLY2ZPy/CcdsOLiwF1ZADucOLhnl0Hnr2jZKOhV0YqwMfvmJZ+00ml08tGhw0UykEflxDuwQWgGstchSaKfCfY84O0BfA0WzDqEP135a9NLjBbIFUX3KPtjbRqacXJ8JMguA==',
        shares: ['wK+Ofw3rwb8x04GiHvvXLgxlPw2s5kBSFndoCNrz+JQdP941w75MWiA='],
    },
    {
        id: '24',
        lastModified: '2004-09-27T18:39:53.017Z',
        key: 'Ie6hKJS9gaKRiNcn9MO5nWUR9pLu4brRLb0IZw7XevSuzqlYm8hK38L5zoaZiSijEzcnXBSWWpU=',
        title: 'F2XlcogAOnHC1wGBxzi4hgKHcqhfudcLg2xF5HjjiLD0alewehBu4PeYN25Jw8xQoDJCBcI7IMOF8dOOo7Tnh1o34XCk/hVwu6BHjmkrJCZioVCF3Dis/b8gTzT1jyXoew==',
        note: 'RiyJqfUQoHIPh1VjIC2oAiydgeHJfuRU6SXdqY5Dku1WagddHK7H/NQMC8iuXwZ2tyd3mY9hjr6yGcCXGlUPb99sJSHOdh8k8VK09C7PLnxd7/c79yrlH8/wqWJJi3dR42Bo2g/SPEd+99f5lMnnq1L8PnaPlOAgT2YJwCuyT4UCsg2sB3qlyoS498Ge67TMiW+FQV0rJLyCNtWJNL6/rhb9PzblxFnBoNwNGjjERwHxaCuLmiZKMtPOZvxIdcgtJxYCo6iKazlY6ixCimVQMQemsmmpebFEN6Fz/9t37OGuUMkSjoGli2qYJfERT22Mep/zR1oNIajVYYD/fPrvoVTJDhuKNAJRqUSqORnd9lSXGQx2koYO5fRNcaFhY2xavchcYeI5CF+QbEwqqkRzNDIKMQxcSk7hMtvq9ffeoZIWMEvBUPUK/Uo/Dv0LVw+bka+MaPEJmWjT+IequxYpcXBsfEDvwsKY0C5dAoW2ZlDocYL3HMPu2Q==',
        shares: ['e7IOLm88mtt1P/Cb+ZaE1Dz45sCTKZV+BHIoC1BdCP9qzUxf5F/p7Bg='],
    },
];

type NoteDto = {
    id: string;
    lastModified: string;
    title: string;
    note: string;
    key: string;
    shares: string[];
};

class NoteService {
    private cryptoWorker: typeof CryptoWorker;
    private noteController: NoteController;
    private masterKey: string;
    private masterEmail: string;

    private async createEncryptedNote(title: string, body: string) {
        return this.cryptoWorker.encryptWrappedData(
            [title, body, this.masterEmail],
            this.masterKey
        );
    }

    private async decryptNote(noteDto: NoteDto): Promise<Note> {
        let title = '';
        let body = '';
        let key = new ArrayBuffer(0);
        let shares: string[] = [];
        let lastModified: Date | undefined;

        try {
            lastModified = new Date(noteDto.lastModified);
        } catch (error) {}

        try {
            const { key: decryptedKey, plainTexts } =
                await this.cryptoWorker.decryptWrappedData(
                    [noteDto.title, noteDto.note, ...noteDto.shares],
                    noteDto.key,
                    this.masterKey
                );
            key = decryptedKey;
            title = plainTexts[0];
            body = plainTexts[1];
            shares = plainTexts.slice(2);
        } catch (error) {}

        return {
            id: noteDto.id,
            lastModified,
            title,
            body,
            key,
            shares,
        };
    }

    constructor(
        cryptoWorker: any,
        account: Account,
        client: ApolloClient<NormalizedCacheObject>
    ) {
        this.masterKey = account.masterKey;
        this.masterEmail = account.email;
        this.cryptoWorker = cryptoWorker;
        this.noteController = new NoteController(client, account.jwt);
    }

    async getNoteCount() {
        // TODO: connect to real api later
        return encryptedNotes.length;
    }

    async getNotes(offset: number, limit: number, sortType: GridSortDirection) {
        // TODO: connect to real api later

        return new Promise((resolve) => {
            let notes = encryptedNotes.sort((a, b) =>
                a.lastModified < b.lastModified
                    ? -1
                    : a.lastModified === b.lastModified
                    ? 0
                    : 1
            );
            if (sortType === 'desc') notes = notes.reverse();
            resolve(
                Promise.all(
                    notes
                        .slice(offset, offset + limit)
                        .map(this.decryptNote.bind(this))
                )
            );
        }) as Promise<Note[]>;
    }

    async createNote(title: string, body: string) {
        const [encryptedKey, encryptedTitle, encryptedBody, encryptedEmail] =
            await this.createEncryptedNote(title, body);
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    async updateNote(
        id: string,
        title: string,
        body: string,
        key: ArrayBuffer
    ) {
        const [encryptedUser, encryptedPass] =
            await this.cryptoWorker.encryptData([title, body], key);
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    async deleteNote(id: string) {
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }
}

export default NoteService;

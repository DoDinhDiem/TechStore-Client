import { Component } from '@angular/core'
import { ProfileRankModule } from '../profile-rank/profile-rank.module'
import { ProfileService } from 'src/app/Service/profile.service'
import { AccountService } from 'src/app/Service/account.service'
import { baseUrl } from 'src/app/Api/baseHttp'
import { IHoaDon } from 'src/app/Models/hoa-don'
import { ConfirmationService, MessageService } from 'primeng/api'

@Component({
    selector: 'app-profile-history',
    templateUrl: './profile-history.component.html',
    styleUrls: ['./profile-history.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class ProfileHistoryComponent {
    baseUrl = baseUrl
    selectedStatus: number | null = null
    constructor(private profileService: ProfileService, private accountService: AccountService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

    chitiet: any
    chitietList: any

    name = this.accountService.getfullNameFromToken()

    ngOnInit() {
        this.loadData()
    }

    totalAmount: number = 0
    loadData() {
        this.profileService.getLichSuMuaHang(this.email, this.trangThai, this.currentPage, this.selectedPageSize).subscribe((data: any) => {
            this.chitietList = data
            this.totalAmount = data.totalAmount
            console.log(data)
        })
    }

    //Khai báo key, page, pageSize
    email = this.accountService.getEmailFromToken()
    trangThai: any = ''
    currentPage: number = 1
    selectedPageSize: number = 10

    //Tìm kiếm
    filterByStatus(id: any) {
        if (id === 'tatca') {
            this.trangThai = ''
            this.selectedStatus = null
        } else {
            this.trangThai = id
            this.selectedStatus = id
        }
        this.loadData()
    }
    //Khi pageSize thay đổi
    onPageSizeChange() {
        this.loadData()
    }

    //Khi thay đổi page
    onPageChange(page: number) {
        this.currentPage = page
        this.loadData()
    }

    //Back khi phân trang
    onPreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--
            this.loadData()
        }
    }

    //Next phân trang
    onNextPage() {
        if (this.currentPage < this.getPageCount()) {
            this.currentPage++
            this.loadData()
        }
    }

    //Tình số page
    getPageCount(): number {
        if (!this.chitietList || !this.chitietList.totalItems || this.selectedPageSize <= 0) {
            return 0
        }
        return Math.ceil(this.chitietList.totalItems / this.selectedPageSize)
    }

    //Hiển thị page
    getPageNumbers(): number[] {
        const pageCount = this.getPageCount()
        if (pageCount <= 0) {
            return []
        }
        return Array(pageCount)
            .fill(0)
            .map((x, i) => i + 1)
    }

    //Hiển thị từ
    getStartIndex(): number {
        return (this.currentPage - 1) * this.selectedPageSize + 1
    }

    //Hiển thị đến
    getEndIndex(): number {
        if (this.selectedPageSize >= this.chitietList?.totalItems) {
            return this.chitietList?.totalItems
        } else {
            const endIndex = this.currentPage * this.selectedPageSize
            return endIndex > this.selectedPageSize ? this.selectedPageSize : endIndex
        }
    }

    hoadonDetail!: any
    chiTietHoaDon!: any
    showDetail(hoaDon: IHoaDon) {
        this.profileService.getById(hoaDon.id).subscribe((data) => {
            this.hoadonDetail = data.hoaDons
            this.chiTietHoaDon = data.chiTiet
        })
    }

    hoaDon: IHoaDon = {}
    huyHang(id: any) {
        this.confirmationService.confirm({
            message: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
            header: 'Thông báo',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.hoaDon.trangThaiDonHang = 4
                console.log(this.hoaDon)
                this.profileService.getUpdateDonHang(id, this.hoaDon).subscribe((res) => {
                    this.loadData()
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thông báo',
                        detail: res.message,
                        life: 3000
                    })
                })
            }
        })
    }
}

class AdditionalServicesController < ApplicationController
  # GET /additional_services
  # GET /additional_services.json
  def index
    @additional_services = AdditionalService.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @additional_services }
    end
  end

  # GET /additional_services/1
  # GET /additional_services/1.json
  def show
    @additional_service = AdditionalService.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @additional_service }
    end
  end

  # GET /additional_services/new
  # GET /additional_services/new.json
  def new
    @additional_service = AdditionalService.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @additional_service }
    end
  end

  # GET /additional_services/1/edit
  def edit
    @additional_service = AdditionalService.find(params[:id])
  end

  # POST /additional_services
  # POST /additional_services.json
  def create
    @additional_service = AdditionalService.new(params[:additional_service])

    respond_to do |format|
      if @additional_service.save
        format.html { redirect_to @additional_service, notice: 'Additional service was successfully created.' }
        format.json { render json: @additional_service, status: :created, location: @additional_service }
      else
        format.html { render action: "new" }
        format.json { render json: @additional_service.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /additional_services/1
  # PUT /additional_services/1.json
  def update
    @additional_service = AdditionalService.find(params[:id])

    respond_to do |format|
      if @additional_service.update_attributes(params[:additional_service])
        format.html { redirect_to @additional_service, notice: 'Additional service was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @additional_service.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /additional_services/1
  # DELETE /additional_services/1.json
  def destroy
    @additional_service = AdditionalService.find(params[:id])
    @additional_service.destroy

    respond_to do |format|
      format.html { redirect_to additional_services_url }
      format.json { head :no_content }
    end
  end
end

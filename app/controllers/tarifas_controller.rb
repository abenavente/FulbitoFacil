class TarifasController < ApplicationController
  # GET /tarifas
  # GET /tarifas.json
  def index
    @search = Tarifa.where(:cancha_id => params[:id])     
    @tarifas= @search.all  

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @tarifas }
    end
  end

  # GET /tarifas/1
  # GET /tarifas/1.json
  def show
    @tarifa = Tarifa.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @tarifa }
    end
  end

  # GET /tarifas/new
  # GET /tarifas/new.json
  def new
    @tarifa = Tarifa.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @tarifa }
    end
  end

  # GET /tarifas/1/edit
  def edit
    @tarifa = Tarifa.find(params[:id])
  end

  # POST /tarifas
  # POST /tarifas.json
  def create
    @tarifa = Tarifa.new(params[:tarifa])

    respond_to do |format|
      if @tarifa.save
        format.html { redirect_to @tarifa, notice: 'Tarifa was successfully created.' }
        format.json { render json: @tarifa, status: :created, location: @tarifa }
      else
        format.html { render action: "new" }
        format.json { render json: @tarifa.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /tarifas/1
  # PUT /tarifas/1.json
  def update
    @tarifa = Tarifa.find(params[:id])

    respond_to do |format|
      if @tarifa.update_attributes(params[:tarifa])
        format.html { redirect_to @tarifa, notice: 'Tarifa was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @tarifa.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tarifas/1
  # DELETE /tarifas/1.json
  def destroy
    @tarifa = Tarifa.find(params[:id])
    @tarifa.destroy

    respond_to do |format|
      format.html { redirect_to tarifas_url }
      format.json { head :no_content }
    end
  end
end

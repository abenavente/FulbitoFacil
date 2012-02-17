class DiaSemanasController < ApplicationController
  # GET /dia_semanas
  # GET /dia_semanas.json
  def index
    @dia_semanas = DiaSemana.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @dia_semanas }
    end
  end

  # GET /dia_semanas/1
  # GET /dia_semanas/1.json
  def show
    @dia_semana = DiaSemana.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @dia_semana }
    end
  end

  # GET /dia_semanas/new
  # GET /dia_semanas/new.json
  def new
    @dia_semana = DiaSemana.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @dia_semana }
    end
  end

  # GET /dia_semanas/1/edit
  def edit
    @dia_semana = DiaSemana.find(params[:id])
  end

  # POST /dia_semanas
  # POST /dia_semanas.json
  def create
    @dia_semana = DiaSemana.new(params[:dia_semana])

    respond_to do |format|
      if @dia_semana.save
        format.html { redirect_to @dia_semana, notice: 'Dia semana was successfully created.' }
        format.json { render json: @dia_semana, status: :created, location: @dia_semana }
      else
        format.html { render action: "new" }
        format.json { render json: @dia_semana.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /dia_semanas/1
  # PUT /dia_semanas/1.json
  def update
    @dia_semana = DiaSemana.find(params[:id])

    respond_to do |format|
      if @dia_semana.update_attributes(params[:dia_semana])
        format.html { redirect_to @dia_semana, notice: 'Dia semana was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @dia_semana.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /dia_semanas/1
  # DELETE /dia_semanas/1.json
  def destroy
    @dia_semana = DiaSemana.find(params[:id])
    @dia_semana.destroy

    respond_to do |format|
      format.html { redirect_to dia_semanas_url }
      format.json { head :no_content }
    end
  end
end
